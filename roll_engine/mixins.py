from __future__ import absolute_import

import logging
from functools import wraps

from celery import chain, chord, states
from kombu.utils import uuid

from django.contrib.auth.models import AnonymousUser

from roll_engine.utils.log import get_logger
from roll_engine.celery import app
from roll_engine import constants as _
from roll_engine.exceptions import ActionNotAllowed

re_logger = get_logger()
logger = logging.getLogger(__name__)


def log_action(msg=''):
    def decorator(func):
        @wraps(func)
        def func_wrapper(deployment, *args, **kwargs):
            operator = kwargs.get('operator', AnonymousUser())
            is_retry = kwargs.get('is_retry', False)
            message = '{} for retry'.format(msg) if is_retry else msg
            deployment.actions.create(
                action=func.__name__, message=message,
                operator=getattr(operator, 'username', ''))
            kwargs['operator'] = operator
            func(deployment, *args, **kwargs)
        return func_wrapper
    return decorator


def _revoke_chain(task_id, terminate=False):
    result = app.AsyncResult(task_id)
    while result:
        status = result.status
        children = result.children
        logger.warning("Result {} status: {}".format(result.id, status))

        if status in states.UNREADY_STATES:
            result.revoke(terminate=terminate)
        if children:
            if len(children) == 1:
                result = children[0]
            else:  # len(result.children) > 1:
                raise ActionNotAllowed('chain is not linear')
        else:
            break


class StartMixin(object):
    @log_action(msg='activate deployment')
    def start(self, operator=None):
        try:
            start_method = self.smoke
        except AttributeError:
            start_method = self.rollout
        finally:
            return start_method(operator=operator)


class SmokeMixin(object):
    def __create_canvas(self, operator=None):
        deployment_id = self.id
        tasks = self._meta.task_set
        fort_batch = self.get_fort_batch()
        target_canvases = [tgt.create_smoke_canvas(operator)
                           for tgt in fort_batch.targets.all()]
        smoke_success_status = self._meta.smoke_success_status

        canvas = chain(
            tasks.start_smoking.si(tasks, deployment_id, operator),
            tasks.start_rolling_batch.subtask(args=(tasks, deployment_id,
                                                    fort_batch.id, operator),
                                              immutable=True),
            chord(target_canvases,
                  tasks.finish_smoking.si(tasks, deployment_id,
                                          smoke_success_status, operator))
        )
        return canvas

    @log_action(msg='start smoking')
    def smoke(self, action=_.SMOKING, operator=None, is_retry=False):
        canvas = self.__create_canvas(operator)
        canvas.delay()
        self.trans(action)


class BakeMixin(object):
    def __create_canvas(self, operator=None, is_retry=False):
        deployment_id = self.id
        tasks = self._meta.task_set
        fort_batch = self.get_fort_batch()
        target_canvases = [tgt.create_bake_canvas(operator)
                           for tgt in fort_batch.targets.all()]
        ts = [
            tasks.start_baking.si(tasks, deployment_id, operator),
            chord(target_canvases, tasks.finish_rolling_batch.si(
                tasks, deployment_id, fort_batch.id, operator)),
            tasks.finish_baking.si(tasks, deployment_id, operator)
        ]

        if is_retry:
            restart_rolling_batch = tasks.start_rolling_batch.subtask(
                args=(tasks, deployment_id, fort_batch.id, operator),
                immutable=True)
            ts.insert(1, restart_rolling_batch)

        canvas = chain(*ts)
        return canvas

    @log_action(msg='start baking')
    def bake(self, action=_.BAKING, operator=None, is_retry=False):
        canvas = self.__create_canvas(operator, is_retry)
        canvas.delay()
        self.trans(action)


class RolloutMixin(object):
    def __create_canvas(self, operator=None, is_retry=False):
        deployment_id = self.id
        tasks = self._meta.task_set

        batches = self.get_rollout_batches()
        if is_retry:
            # only retry non-successfull deployment batches
            batches = batches.exclude(status=_.SUCCESS)

        batch_ids = list(batches.values_list('id', flat=True))  # evaluate out
        batch_canvases = [batch.create_canvas(operator) for batch in batches]
        ts = [tasks.start_rolling_out.si(tasks, deployment_id, operator)]
        ts.extend(batch_canvases)
        ts.append(tasks.finish_rolling_out.si(tasks, deployment_id, batch_ids,
                                              operator))
        ts.append(tasks.finish_deployment.si(tasks, deployment_id, operator))

        canvas = chain(*ts)
        return canvas

    @log_action(msg='start rolling out')
    def rollout(self, action=_.ROLLING_OUT, operator=None, is_retry=False):
        self.trans(action)  # switch status before rolling
        canvas = self.__create_canvas(operator, is_retry)
        canvas.delay()


class BrakeMixin(object):
    @log_action(msg='brake deployment')
    def brake(self, operator=None):
        status = self.status.lower()

        extra = {'deploy': self, 'operator': operator}
        re_logger.info('Deployment braked', extra=extra)

        self.revoke(update_status=False)

        action = '{}_brake'.format(status)
        self.trans(action)

    @log_action(msg='resume deployment')
    def resume(self, operator=None):
        extra = {'deploy': self, 'operator': operator}
        re_logger.info('Deployment resumed', extra=extra)
        action = '{}_resume'.format(self.status.lower())
        handler = self.get_resume_handler()
        if handler is not None:
            handler(action, operator=operator)
        else:
            self.trans(action)


class RevokeMixin(object):
    @log_action(msg='revoke deployment')
    def revoke(self, terminate=None, operator=None, update_status=True):
        batches = self.get_revoke_batches()
        for batch in batches:
            batch.revoke(update_status)

        extra = {'deploy': self, 'operator': operator}
        re_logger.info('Deployment revoked', extra=extra)

        if update_status:
            self.trans(_.REVOKED)


class RetryMixin(object):
    @log_action(msg='retry deployment')
    def retry(self, operator=None):
        extra = {'deploy': self, 'operator': operator}
        re_logger.info('Retry deployment', extra=extra)
        handler = self.get_retry_handler()
        action = '{}_retry'.format(handler.__name__)
        handler(action, operator=operator, is_retry=True)


class BatchMixin(object):
    def create_canvas(self, operator=None):
        batch_id = self.id
        deployment_id = self.deployment_id
        targets = self.targets.all()
        deployment = self.deployment
        tasks = deployment._meta.task_set
        first_rollout_batch = deployment.get_rollout_batches().first()

        if self == first_rollout_batch:
            pause_time = 0
        else:
            pause_time = self.pause_time

        target_canvases = [t.create_rollout_canvas(operator) for t in targets]
        chain_args = [
            tasks.start_rolling_batch.subtask(
                args=(tasks, deployment_id, batch_id, operator),
                countdown=pause_time, immutable=True)
        ]
        if target_canvases:
            chain_args.append(
                chord(target_canvases, tasks.finish_rolling_batch.si(
                    tasks, deployment_id, batch_id, operator)
                )
            )
        else:
            # empty batch is ok
            chain_args.append(
                tasks.finish_rolling_batch.si(
                    tasks, deployment_id, batch_id, operator)
            )
        return chain(*chain_args)

    def revoke(self, update_status=True):
        for tgt in self.targets.all():
            tgt.revoke()
        if update_status:
            self.trans(_.REVOKED)


class TargetMixin(object):
    def __create_canvas(self, tasks, operator=None):
        task_id = uuid()
        deployment_id = self.batch.deployment_id
        target_id = self.id

        canvas = chain(tasks[0].subtask(args=(tasks[0].__self__, deployment_id,
                                              target_id, operator),
                                        immutable=True,
                                        task_id=task_id),
                       *[t.si(t.__self__, deployment_id, target_id, operator)
                         for t in tasks[1:]]
                       )
        self.task_id = task_id
        self.save(update_fields=['task_id', 'updated_at'])
        return canvas

    def create_smoke_canvas(self, operator=None):
        smoke_job = self.batch.deployment._meta.task_set.smoke_job()
        return self.__create_canvas(smoke_job, operator)

    def create_bake_canvas(self, operator=None):
        bake_job = self.batch.deployment._meta.task_set.bake_job()
        return self.__create_canvas(bake_job, operator)

    def create_rollout_canvas(self, operator=None):
        rollout_job = self.batch.deployment._meta.task_set.rollout_job()
        return self.__create_canvas(rollout_job, operator)

    def revoke(self):
        if self.task_id is not None:
            _revoke_chain(self.task_id, True)
