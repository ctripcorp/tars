from django.db import models

from roll_engine.exceptions import MetaMissing, DeploymentError
from roll_engine.utils.log import get_logger
from roll_engine.mixins import TargetMixin

from .base import FSMedModel, InheritanceMetaclass, RollEngineOptions


re_logger = get_logger()


class DeploymentTarget(TargetMixin, FSMedModel):
    __metaclass__ = InheritanceMetaclass

    task_id = models.CharField(max_length=36, null=True, blank=True)
    is_fort = models.BooleanField(default=False)
    _hostname = models.CharField(
        max_length=100, null=True, blank=True, db_column='hostname')
    _ip_address = models.CharField(
        max_length=64, null=True, blank=True, db_column='ip_address')

    class Meta:
        abstract = True
        salt_timeout = 180

    @classmethod
    def validate_meta(cls):
        cls._meta.__class__ = RollEngineOptions
        if not hasattr(cls._meta, 'salt_timeout'):
            raise MetaMissing('missing salt_timeout in Meta of {} Model'.
                              format(cls.__name__))

    @property
    def extras(self):
        return {'deploy': self.batch.deployment, 'tgt': self}

    @property
    def hostname(self):
        return self._hostname

    @hostname.setter
    def hostname(self, value):
        self._hostname = value

    @property
    def ip_address(self):
        return self._ip_address

    @ip_address.setter
    def ip_address(self, value):
        self._ip_address = value

    @ip_address.deleter
    def ip_address(self):
        del self._ip_address

    def get_object(self):
        return self

    def __unicode__(self):
        return self.hostname

    def get_extras(self):
        """ would be deprecated soon """
        return {'deploy': self.batch.deployment, 'tgt': self}

    def pull_out(self):
        raise DeploymentError('override pull_out to implement disable from LB, '
                              'return boolean to indicate result')

    def pull_in(self):
        raise DeploymentError('override pull_in to implement enable in LB, '
                              'return boolean to indicate result')

    def call_salt(self, module_func, *args, **kwargs):
        log = kwargs.pop('log', True)
        ping = kwargs.pop('ping', True)

        hostname = self.hostname
        deployment = self.batch.deployment
        salt_client, salt_module = deployment.salt_client_and_module()
        if '.' not in module_func:
            module_func = '{module}.{cmd}'.format(module=salt_module,
                                                  cmd=module_func)
        if log:
            log_extra = deployment.build_deployment_log(self)
            kwargs.update({'log_extra': log_extra})
        kwargs.setdefault('wait_timeout', self._meta.salt_timeout)

        try:
            if ping:
                ping_result_tuple = salt_client.run_module_await(
                    [hostname],
                    'test.ping',
                    wait_timeout=15
                )

                if not ping_result_tuple[0].get(hostname, False):
                    raise Exception('salt minion {} is not available: {}'
                                    .format(hostname, ping_result_tuple[1]))

            resp, description = salt_client.run_module_await(
                [hostname], module_func, *args, **kwargs)
        except Exception as e:
            resp = {}
            description = 'salt error: {}'.format(e)
            arguments = "module_func: {}, args: {}, kwargs: {}".format(
                module_func, args, kwargs)
            re_logger.error('{} with : [{}]'.format(description, arguments))
        description = description or 'view agent log for detail'

        if hostname in resp:
            if isinstance(resp[hostname], basestring):
                if 'exception' in resp[hostname] and 'Traceback' in resp[hostname]:
                    description = resp[hostname]
                else:
                    return True, resp[hostname]
            elif resp[hostname]:
                return True, description
        return False, description
