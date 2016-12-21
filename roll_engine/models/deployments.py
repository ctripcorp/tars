from __future__ import absolute_import

from celery.utils.log import get_task_logger

from roll_engine import constants as _
from roll_engine.exceptions import (ActionNotAllowed, ActionNotExist,
                                    MetaMissing, DeploymentError)
from roll_engine.fsm import FSMixin, FortFSMixin
from roll_engine.mixins import (StartMixin, RolloutMixin, SmokeMixin, BakeMixin,
                                RevokeMixin, BrakeMixin, RetryMixin)
from roll_engine.factory import BatchFactory
from roll_engine.tasks import Tasks

from .base import FSMedModel, InheritanceMetaclass, RollEngineOptions

celery_logger = get_task_logger(__name__)


class Deployment(StartMixin, RolloutMixin, BrakeMixin, RevokeMixin,
                 RetryMixin, FSMixin, FSMedModel):
    __metaclass__ = InheritanceMetaclass

    class Meta:
        abstract = True
        get_latest_by = 'id'
        batch_factory = BatchFactory()
        task_set = Tasks

    @classmethod
    def validate_meta(cls):
        cls._meta.__class__ = RollEngineOptions
        for name in ('batch_factory', 'task_set'):
            if not hasattr(cls._meta, name):
                raise MetaMissing('missing {} in Meta of {} Model'
                                  .format(name, cls.__name__))

    def get_object(self):
        return self

    def can_brake(self):
        return True

    def __unicode__(self):
        return unicode(self.id)

    @property
    def extras(self):
        return {'deploy': self}

    def get_extras(self):
        """ would be deprecated soon """
        return {'deploy': self}

    def _create_batch_and_target(self):
        servers = self.servers_to_be_deployed()
        if servers:
            self._meta.batch_factory.generate_deployment_batches(self, servers)
        else:
            raise DeploymentError('no server to be deployed')

    def servers_to_be_deployed(self):
        raise DeploymentError('override servers_to_be_deployed to return '
                              'server instances for deploying')

    def build_deployment_log(self, deployment_target=None, operator=None):
        log = {}
        log['deploy_id'] = self.id
        log['deploy_status'] = self.status
        log['deploy_target'] = getattr(deployment_target, 'id', -1)
        log['deploy_target_status'] = getattr(deployment_target, 'status', '')
        log['deploy_target_name'] = getattr(deployment_target, 'hostname', '')
        log['mail'] = getattr(operator, 'email', '')
        return log

    def log_callback(self, log):
        celery_logger.info(log)

    def save(self, *args, **kwargs):
        if self.pk is None:
            super(Deployment, self).save(*args, **kwargs)
            self._create_batch_and_target()
            # convert batch_pattern to full format
            self.config.batch_pattern = self._meta.batch_factory\
                .validate_batch_pattern(self.config.batch_pattern)
            self.config.save()

        else:
            super(Deployment, self).save(*args, **kwargs)

    def get_rollout_batches(self):
        queryset = self.batches.order_by('index')
        if self.config.mode == self.config.MANUAL:
            pending_batches = queryset.exclude(status=_.SUCCESS)
            if pending_batches.exists():
                first_pending_batch = pending_batches.first()
                queryset = pending_batches.filter(id=first_pending_batch.id)
            else:
                queryset = self.batches.none()
        return queryset

    def is_running(self):
        return self.status not in [_.REVOKED, _.SUCCESS]

    def run(self, action, user):
        next_transition = next(
            (ts for ts in self.get_available_status_transitions()
             if (ts.custom.get('user_action')
                 and action == (ts.custom.get('alias') or ts.name))),
            None)

        if next_transition is not None:
            try:
                action_method = getattr(self, action)
            except AttributeError:
                raise ActionNotExist('Action {} is not defined'.format(action))
            else:
                action_method(operator=user)
        else:
            error_msg = ('action {0} is forbidden since deployment {1.id} in '
                         '{1.status} status').format(action, self)
            available_actions = self.next_user_actions()
            if available_actions:
                error_msg = '{} is only available to [{}]'\
                    .format(error_msg, ', '.join(available_actions))
            else:
                error_msg = '{} has reached terminal status'\
                    .format(error_msg)
            raise ActionNotAllowed(error_msg)

    def is_braked(self):
        return self.status in self._brakes

    def get_rollback_deployments(self):
        rollback_deployment = self.parent
        rollback_deployment_ids = []

        while rollback_deployment is not None:
            rollback_deployment_ids.append(rollback_deployment.id)
            rollback_deployment = rollback_deployment.parent
        return Deployment.objects.filter(id__in=rollback_deployment_ids)\
            .order_by('-id')

    def get_retry_handler(self):
        return self.rollout

    def get_resume_handler(self):
        handler_map = {_.ROLLOUT_BRAKED: self.rollout}

        return handler_map.get(self.status)

    def get_revoke_batches(self):
        current_status = self.status

        if current_status == _.ROLLING_OUT:
            batches = self.get_rollout_batches()
        else:
            batches = self.batches.none()
        return batches

    def salt_client_and_module(self):
        raise DeploymentError('override salt_client_and_module to return '
                              'salt_client and salt_module')


class FortMixin(SmokeMixin, BakeMixin, FortFSMixin):
    @classmethod
    def validate_meta(cls):
        cls._meta.__class__ = RollEngineOptions
        if not hasattr(cls._meta, 'smoke_success_status'):
            raise MetaMissing('missing smoke_success_status in Meta of {}'
                              ' Model'.format(cls.__name__))
        super(FortFSMixin, cls).validate_meta()

    def get_fort_batch(self):
        return self.batches.order_by('index').first()

    def get_forts(self, valid_servers=None):
        raise DeploymentError(
            "override get_forts to return list of fort servers' hostname")

    def get_rollout_batches(self):
        queryset = self.batches.order_by('index').exclude(index=1)
        if self.config.mode == self.config.MANUAL:
            pending_batches = queryset.exclude(status=_.SUCCESS)
            if pending_batches.exists():
                first_pending_batch = pending_batches.first()
                queryset = pending_batches.filter(id=first_pending_batch.id)
            else:
                queryset = self.batches.none()
        return queryset

    def get_retry_handler(self):
        handler_map = {_.SMOKE_FAILURE: self.smoke,
                       _.BAKE_FAILURE: self.bake,
                       _.ROLLOUT_FAILURE: self.rollout}

        return handler_map.get(self.status, self.rollout)

    def get_resume_handler(self):
        handler_map = {_.SMOKE_BRAKED: self.smoke,
                       _.BAKE_BRAKED: self.bake,
                       _.ROLLOUT_BRAKED: self.rollout}

        return handler_map.get(self.status)

    def get_revoke_batches(self):
        current_status = self.status

        if current_status in [_.BAKING, _.SMOKING]:
            fort_batch = self.get_fort_batch()
            batches = self.batches.filter(id=fort_batch.id)
        elif current_status == _.ROLLING_OUT:
            batches = self.get_rollout_batches()
        else:
            batches = self.batches.none()
        return batches

    def _create_batch_and_target(self):
        servers = self.servers_to_be_deployed()
        svr_hostnames = [svr['hostname'] for svr in servers]
        if servers:
            self._meta.batch_factory.generate_deployment_batches(
                self, servers, self.get_forts(valid_servers=svr_hostnames))
        else:
            raise DeploymentError('no server to be deployed')
