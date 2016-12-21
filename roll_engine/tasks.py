from __future__ import absolute_import

from functools import wraps

from celery import shared_task
from celery.utils.log import get_task_logger

from django.utils.deconstruct import deconstructible

from roll_engine import constants
from roll_engine.utils.log import get_logger
from roll_engine.exceptions import JobMissing


re_logger = get_logger()
celery_logger = get_task_logger(__name__)


def on_error(func):
    @wraps(func)
    def error_wrapper(*args, **kwargs):
        try:
            func(*args, **kwargs)
        except Exception as e:
            celery_logger.exception(
                'calling "{}" error: {}'.format(func.__name__, e))
    return error_wrapper


@deconstructible
class Tasks(object):
    @classmethod
    def _retrieve_models(cls, deployment=None, batch=None, target=None):
        pass

    @classmethod
    @shared_task(ignore_result=True)
    @on_error
    def start_smoking(cls, deploy_id, operator=None):
        deploy = cls._retrieve_models(deployment_id=deploy_id).deployment
        re_logger.info('Smoking begin',
                       extra={'deploy': deploy, 'operator': operator})

    @classmethod
    @shared_task(ignore_result=True)
    @on_error
    def finish_smoking(cls, deploy_id, success_status, operator=None):
        deploy = cls._retrieve_models(deployment_id=deploy_id).deployment
        extra = {'deploy': deploy, 'operator': operator}

        fort_batch = deploy.get_fort_batch()
        nonsuccess_targets = fort_batch.targets.exclude(status=success_status)

        if not nonsuccess_targets.exists():
            if deploy.safe_trans(constants.SMOKE_SUCCESS):
                re_logger.info('Smoking success', extra=extra)
        else:
            if deploy.safe_trans(constants.SMOKE_FAILURE):
                re_logger.info('Smoking failure', extra=extra)

    @classmethod
    @shared_task(ignore_result=True)
    @on_error
    def start_baking(cls, deploy_id, operator=None):
        deploy = cls._retrieve_models(deployment_id=deploy_id).deployment
        re_logger.info('Baking begin',
                       extra={'deploy': deploy, 'operator': operator})

    @classmethod
    @shared_task(ignore_result=True)
    @on_error
    def finish_baking(cls, deploy_id, operator=None):
        deploy = cls._retrieve_models(deployment_id=deploy_id).deployment
        extra = {'deploy': deploy, 'operator': operator}

        fort_batch = deploy.get_fort_batch()

        if fort_batch and fort_batch.status == constants.SUCCESS:
            if deploy.safe_trans(constants.BAKE_SUCCESS):
                re_logger.info('Baking success', extra=extra)
        else:
            if deploy.safe_trans(constants.BAKE_FAILURE):
                re_logger.error('Baking fail', extra=extra)

    @classmethod
    @shared_task
    @on_error
    def start_rolling_batch(cls, deploy_id, batch_id, operator=None):
        batch = cls._retrieve_models(batch_id=batch_id).batch
        batch.safe_trans(constants.DEPLOYING)

    @classmethod
    @shared_task
    @on_error
    def finish_rolling_batch(cls, deploy_id, batch_id, operator=None):
        batch = cls._retrieve_models(batch_id=batch_id).batch

        nonsuccess_targets = batch.targets.exclude(status=constants.SUCCESS)
        batch.safe_trans(constants.FAILURE
                         if nonsuccess_targets.exists() else constants.SUCCESS)

    @classmethod
    @shared_task
    @on_error
    def start_rolling_target(cls, deploy_id, tgt_id, operator=None):
        tgt = cls._retrieve_models(target_id=tgt_id).target
        tgt.safe_trans(constants.PENDING)

    @classmethod
    @shared_task
    @on_error
    def finish_rolling_target(cls, deploy_id, tgt_id, operator=None):
        tgt = cls._retrieve_models(target_id=tgt_id).target
        tgt.safe_trans(constants.SUCCESS)

    @classmethod
    @shared_task(ignore_result=True)
    @on_error
    def finish_deployment(cls, deploy_id, operator=None):
        deploy = cls._retrieve_models(deployment_id=deploy_id).deployment
        extra = {'deploy': deploy, 'operator': operator}
        idle_batches = deploy.batches.filter(status=constants.PENDING)
        if not idle_batches.exists():
            if deploy.status == constants.ROLLOUT_FAILURE:
                deploy.safe_trans(constants.FAILURE)
                re_logger.info('Deployment failed', extra=extra)
            elif deploy.status == constants.ROLLOUT_SUCCESS:
                deploy.safe_trans(constants.SUCCESS)
                re_logger.info('Deployment succeeded', extra=extra)

    @classmethod
    @shared_task(ignore_result=True)
    @on_error
    def start_rolling_out(cls, deploy_id, operator=None):
        deploy = cls._retrieve_models(deployment_id=deploy_id).deployment
        re_logger.info('Start rolling out',
                       extra={'deploy': deploy, 'operator': operator})

    @classmethod
    @shared_task(ignore_result=True)
    @on_error
    def finish_rolling_out(cls, deploy_id, batch_ids=None, operator=None):
        if batch_ids is None:
            batch_ids = []
        deploy = cls._retrieve_models(deployment_id=deploy_id).deployment

        nonsuccess_batches = deploy.batches.filter(pk__in=list(batch_ids))\
            .exclude(status=constants.SUCCESS)
        deploy.safe_trans(constants.ROLLOUT_FAILURE
                          if nonsuccess_batches.exists()
                          else constants.ROLLOUT_SUCCESS)
        re_logger.info('Rollout finished',
                       extra={'deploy': deploy, 'operator': operator})

    @classmethod
    @shared_task
    @on_error
    def pull_out(cls, deploy_id, tgt_id, operator=None):
        deploy, _, tgt = cls._retrieve_models(deployment_id=deploy_id,
                                              target_id=tgt_id)
        extra = {'deploy': deploy, 'tgt': tgt, 'operator': operator}

        if not tgt.safe_trans(constants.DISABLING):
            if not tgt.can_disabling():
                re_logger.error('Pull out is stopped, may be caused by upped '
                                'server count checking', extra=extra)
            return

        re_logger.info('Pull out the target', extra=extra)

        result = tgt.pull_out()
        if result:
            tgt.trans(constants.DISABLE_SUCCESS)
            re_logger.info('Pull out target success', extra=extra)
        else:
            tgt.trans(constants.DISABLE_FAILURE)
            re_logger.error('Pull out target fail', extra=extra)

    @classmethod
    @shared_task
    @on_error
    def pull_in(cls, deploy_id, tgt_id, operator=None):
        deploy, _, tgt = cls._retrieve_models(deployment_id=deploy_id,
                                              target_id=tgt_id)
        extra = {'deploy': deploy, 'tgt': tgt, 'operator': operator}

        if not tgt.safe_trans(constants.ENABLING):
            return

        re_logger.info('Pull in the target', extra=extra)

        result = tgt.pull_in()
        if result:
            tgt.trans(constants.ENABLE_SUCCESS)
            re_logger.info('Pull in target success', extra=extra)
        else:
            tgt.trans(constants.ENABLE_FAILURE)
            re_logger.error('Pull in target fail', extra=extra)

    @classmethod
    def rollout_job(cls):
        raise JobMissing('missing rollout_job definition in Task Set {}'.
                         format(cls.__name__))

    @classmethod
    def smoke_job(cls):
        raise JobMissing('missing smoke_job definition in Task Set {}'.
                         format(cls.__name__))

    @classmethod
    def bake_job(cls):
        raise JobMissing('missing bake_job definition in Task Set {}'.
                         format(cls.__name__))
