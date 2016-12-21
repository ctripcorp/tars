import logging
import time

from constance import config
from roll_engine.utils.log import get_logger
# from rest_client import get_remix_client

from .verify import Verify
from ansible_playbook.runplaybook import RunPlaybook

es_logger = get_logger()


def choose_deploy_agency(group):
    return globals().get("{0}Agency".format(group.g_type))


class BaseAgency(object):

    def __init__(self, target):
        self.target = target

    def download_package(self, **kwargs):
        raise NotImplementedError()

    def install_app(self, **kwargs):
        raise NotImplementedError()

    def verify_app(self, **kwargs):
        raise NotImplementedError()

    def skip(self, **kwargs):
        raise NotImplementedError()

    def install_app(self, **kwargs):
        raise NotImplementedError()


class LocalAgency(BaseAgency):

    BUSINESS_PORT = 8080

    def verify_app(self):
        deployment = self.target.deployment
        cfg = deployment.config
        group = deployment.group
        cfg = self.target.batch.deployment.config

        if cfg.ignore_verify_result:
            startup_timeout = 10  # shorten waiting time if ignore verify result
        else:
            startup_timeout = max(cfg.startup_timeout,
                                  self.target._meta.salt_timeout)

        kwargs = self.target._prepare_common_salt_kw()
        kwargs.update({
            'ip_address': self.target.ip_address,
            'httpport': self.BUSINESS_PORT,
            'health_check_url': self.target.deployment.group.health_check_url
        })
        try:
            result = Verify.verify(
                startup_timeout, self.target.extras, **kwargs)
            return (result, 'verify end')
        except Exception, e:
            es_logger.error(str(e), extra=self.target.extras)
            return (False, e)


class STDAgency(BaseAgency):

    def download_package(self):
        pkg = self.target.deployment.package
        download_timeout = 300

        try:
            kwargs = {'path': pkg.bundle_path, 'wait_timeout': download_timeout,
                      'container': pkg.container}
        except PackageError as e:
            return False, str(e)

        args = ['download', pkg.id]

        return self.target.call_salt(*args, **kwargs)

    def install_app(self, **salt_kw):
        deployment = self.target.deployment
        group = deployment.group
        pkg_id = deployment.package_id
        site_name = group.site_name
        path = group.vdir_path
        ceph_container = self.target.batch.deployment.package.container

        kwargs = {
            'path': path,
            'applicationPool': group.app_pool_name,
            'physicalPath': group.physic_path,
            'env': getattr(config, 'ENV', 'prod'),
            'ceph_container': ceph_container,
        }

        if getattr(deployment.config, 'restart_app_pool', False):
            kwargs.update(restart=True)

        kwargs.update(self.target._prepare_common_salt_kw())

        args = ['install', pkg_id, 'app', site_name, path]

        return self.target.call_salt(*args, **kwargs)

    def verify_app(self, **salt_kw):
        deployment = self.target.deployment
        cfg = deployment.config
        group = deployment.group
        site_name = group.site_name
        path = group.vdir_path
        cfg = self.target.batch.deployment.config

        if cfg.ignore_verify_result:
            startup_timeout = 10  # shorten waiting time if ignore verify result
        else:
            startup_timeout = max(cfg.startup_timeout,
                                  self.target._meta.salt_timeout)

        kwargs = {
            'wait_timeout': startup_timeout,
            'timeout': startup_timeout,
        }

        # verify health check url as well
        if group.g_type == 'SLB' and group.health_check_url:
            kwargs.update(extra_urls={group.health_check_url: 'auto_asserter'})

        kwargs.update(self.target._prepare_common_salt_kw())

        args = ['verify', site_name, path]

        return self.target.call_salt(*args, **kwargs)

    def skip(self, **salt_kw):
        deployment = self.target.deployment
        pkg_id = deployment.package_id
        group = deployment.group

        kwargs = self.target._prepare_common_salt_kw()

        # verify health check url as well
        if group.health_check_url:
            kwargs.update(extra_urls={group.health_check_url: 'auto_asserter'})

        args = ['skip', pkg_id, group.site_name, group.vdir_path]

        return self.target.call_salt(*args, **kwargs)


class AnsibleAgency(LocalAgency):

    DEPLOY_USER = 'root'

    hosts_template = """
[all:vars]
env=matrix
login_user={0}
release_version={1}
package_url={2}

[webservers]
{3}
"""

    @property
    def playbook(self):
        return RunPlaybook(self.DEPLOY_USER, es_logger, self.target.extras)

    @property
    def hosts_file(self):
        return self.hosts_template.format(
            self.DEPLOY_USER,
            self.target.deployment.package_id,
            self.target.deployment.package.location,
            self.target.ip_address
        )

    def __init__(self, target):
        self.target = target

    def download_package(self, **kwargs):
        return (True, 'ansible not download')

    def skip(self, **kwargs):
        try:
            check_version = self.playbook.run(self.hosts_file, 'skip', **kwargs)
            check_health_check = self.verify_app()
            if check_version and check_health_check[0]:
                return (True, 'skip deploy')
            else:
                return (False, 'not skip deploy')
        except Exception, e:
            es_logger.error(str(e), extra=self.target.extras)
            return (False, e)

    def install_app(self, **kwargs):
        try:
            result = self.playbook.run(self.hosts_file, 'deploy', **kwargs)
            return (result, 'install end')
        except Exception, e:
            es_logger.error(str(e), extra=self.target.extras)
            return (False, e)


class DKRAgency(LocalAgency):

    DEFAULT_PORT = '8080'
    DEFAULT_ENV = 'test'

    def remix_args(self):
        return {
            'name': self.instance_name(),
            'app_id': self.target.deployment.application_id,
            'idc': self.target.deployment.group.idc,
            'ip': self.target.ip_address,
            'health_check': 'http://{0}:{1}{2}'.format(self.target.ip_address, self.target.deployment.group.business_port or self.DEFAULT_PORT, self.target.deployment.group.health_check_url),
            'env': getattr(config, 'ENV', 'prod').upper(),
            'image': self.target.deployment.package.image,
            'app_version': self.target.deployment.package.version,
            'environments': {'SERVER_VDIR': self.target.deployment.group.vdir_path}
        }

    def instance_name(self):
        app_id = self.target.deployment.application_id
        idc = self.target.deployment.group.idc
        ip_address = self.target.ip_address
        return "{0}_{1}_{2}".format(app_id, idc, ip_address)

    def download_package(self):
        return (True, 'Docker Not Download')

    def skip(self):
        return (False, 'Docker Not skip')

    def install_app(self):
        remix = get_remix_client()
        try:
            message = remix.deploy(self.remix_args())
            es_logger.info(str(message), extra=self.target.extras)
            return (True, message)
        except Exception, e:
            es_logger.error(str(e), extra=self.target.extras)
            return (False, e)
