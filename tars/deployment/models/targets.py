from django.db import models
from constance import config

from rest_client.exceptions import SLBClientError
from roll_engine.utils.log import get_logger
from roll_engine.db import SoftDeleteManager
from roll_engine.models import DeploymentTarget

from tars.server.models import Server, Group
from tars.deployment.fsm import TarsTargetFSMixin
from tars.exceptions import PackageError
from .batches import TarsDeploymentBatch

es_logger = get_logger()


class TarsDeploymentTarget(TarsTargetFSMixin, DeploymentTarget):
    batch = models.ForeignKey(TarsDeploymentBatch, related_name='targets',
                              db_constraint=False, null=True)
    server = models.ForeignKey(Server, related_name='targets',
                               db_constraint=False, null=True)
    is_deleted = models.BooleanField(default=False)
    objects = SoftDeleteManager()

    class Meta:
        db_table = 'deployment_targets'
        salt_timeout = 300

    def get_object(self):
        if self.deployment.group.g_type == Group.G_TYPE_ENUM.join:
            self.__class__ = TarsJoinGroupTarget

        return self

    def delete(self):
        self.is_deleted = True
        self.save()

    @DeploymentTarget.hostname.getter
    def hostname(self):
        hostname = super(TarsDeploymentTarget, self).hostname
        return self.server.hostname if hostname is None else hostname

    @DeploymentTarget.ip_address.getter
    def ip_address(self):
        ip_address = super(TarsDeploymentTarget, self).ip_address
        return self.server.ip_address if ip_address is None else ip_address

    @property
    def deployment(self):
        return self.batch.deployment

    @property
    def agency(self):
        return self.deployment.agency(self)

    def _prepare_common_salt_kw(self):
        """ common params for app_container, ssl, etc. it's safe to pass salt module
            useless params, which are simply ignored
        """
        group = self.deployment.group
        app = self.deployment.application

        salt_kw = {'app_container': app.container, 'ssl': group.is_ssl}

        if app.language in ['java', 'nodejs', 'golang']:
            salt_kw.update(
                httpport=group.business_port,
                health_check_url=group.health_check_url,
                adminport=group.shutdown_port
            )

        return salt_kw

    def download_package(self):
        return self.agency.download_package()

    def install_app(self, **salt_kw):
        return self.agency.install_app(**salt_kw)

    def verify_app(self, **salt_kw):
        return self.agency.verify_app(**salt_kw)

    def skip(self, **salt_kw):
        return self.agency.skip(**salt_kw)

    def pull_out(self):
        slb = self.deployment.slb_client
        try:
            result = slb.pull_out(self.ip_address)
        except SLBClientError as e:
            es_logger.error(str(e), extra=self.extras)
            result = False
        return result

    def pull_in(self):
        slb = self.deployment.slb_client
        try:
            result = slb.pull_in(self.ip_address)

        except SLBClientError as e:
            es_logger.error(str(e), extra=self.extras)
            result = False
        return result


class TarsJoinGroupTarget(TarsDeploymentTarget):

    class Meta:
        proxy = True

    def _prepare_common_salt_kw(self):
        kw = super(TarsJoinGroupTarget, self)._prepare_common_salt_kw()

        # check if this targets belongs to multiple groups, which does not have same meta eg. ssl in common
        related_group_ssl_options = \
            self.deployment.group.servers.verbose_all().filter(hostname=self.hostname).\
            values_list('group__is_ssl', flat=True)

        # uniform ssl option
        if len(related_group_ssl_options) > 1:
            kw.update(
                ssl=all(related_group_ssl_options)
            )

        return kw
