import logging
import operator
import traceback
import yaml
import itertools
from urlparse import urlparse
from collections import OrderedDict

from django.db import models
from django.db import transaction
from django.core.exceptions import ObjectDoesNotExist

from constance import config

from roll_engine.db import TimestampedModel, SoftDeleteManager
from roll_engine import constants as _

from tars.deployment import constants
from tars.exceptions import SyncError, PackageError

logger = logging.getLogger(__name__)
DEFAULT_LANGUAGE = 'net'


def get_default_ignore_fort():
    cur_env = config.ENV.upper()
    return any(i in cur_env for i in ('UAT', 'FAT'))


class Application(TimestampedModel):
    name = models.CharField(max_length=255, null=True)
    environment = models.CharField(max_length=255, null=True, blank=True)
    ignore_fort = models.BooleanField(default=get_default_ignore_fort)
    organization = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = 'applications'

    def __unicode__(self):
        return u"<Application %s>" % self.pk + unicode(self.name)

    def save(self, *args, **kwargs):
        if self.pk is None:
            if not Application.objects.filter(id=self.id).exists():
                self.pk = self.id
        super(Application, self).save(*args, **kwargs)

    def _app_env_tags(self):
        try:
            _app_env = yaml.load(self.environment)
            tags = OrderedDict(
                language=[_app_env.get(':language', DEFAULT_LANGUAGE)],
                container=[_app_env.get(':container', None)],
                others=[k[4:] for k, v in _app_env.items()
                        if k.startswith(':is_') and v]
            )
        except (yaml.scanner.ScannerError, AttributeError):
            tags = OrderedDict(language=[DEFAULT_LANGUAGE],
                               container=[None],
                               others=['environment-error'])
        return tags

    def _tags(self, app_env_tags=None):
        app_env_tags = app_env_tags or self._app_env_tags()
        return reduce(lambda x, y: x+y if y != [None] else [],
                      app_env_tags.values(), [])

    def _language(self, app_env_tags=None):
        app_env_tags = app_env_tags or self._app_env_tags()
        return app_env_tags['language'][0]

    def _container(self, app_env_tags=None):
        app_env_tags = app_env_tags or self._app_env_tags()
        return app_env_tags['container'][0]

    @property
    def tags(self):
        return set(self._tags())

    @property
    def language(self):
        return self._language()

    @property
    def container(self):
        return self._container()

    @property
    def salt_module(self):
        language = self.language
        if language == DEFAULT_LANGUAGE:
            return 'tars'
        else:
            return 'tars_{0}'.format(language)

    @property
    def current_deployment(self):
        try:
            deployment = self.deployments.latest('id')
        except ObjectDoesNotExist:
            return None

        if deployment.status not in constants.HALTED:
            return deployment
        return None

    def is_idle(self, rop_id):
        try:
            deployment = self.deployments.latest('id')
        except ObjectDoesNotExist:
            return True
        else:
            if deployment.status not in constants.HALTED:
                if rop_id is not None:
                    if (deployment.rop_id == rop_id and
                            deployment.status == _.FAILURE):
                        return True
                return False
            else:
                if rop_id is not None:
                    if rop_id != -255:
                        if (deployment.rop_id == rop_id and
                                deployment.status == _.SUCCESS):
                            return False
                    return True
                else:
                    return False

    def rerollable_deployment_ids(self, group_id=None):
        groups = self.groups.all()
        if group_id is not None:
            groups = groups.filter(id=group_id)

        # may cause duplicate deplyoment pk
        return list(itertools.chain(*[g.rerollable_deployment_ids for g in groups]))

    def servers(self, group_ids=None):
        from tars.server.models import Server

        if group_ids is None:
            queryset = self.groups.all()
        else:
            queryset = self.groups.filter(group_id__in=group_ids)
        servers = reduce(operator.or_,
                         [group.servers.all() for group in queryset],
                         Server.objects.none())
        return servers

    def server_num(self):
        return self.servers().order_by('group__group_id')\
            .values('group').annotate(count=models.Count('group'))

    def sync_cms(self, group_ids=None):
        pass

    def forts(self):
        queryset = self.groups.none() if self.ignore_fort else self.groups.all()
        return [{'group': group.id, 'forts': group.forts}
                for group in queryset.order_by('group_id')]

    def summarize_group_status(self):
        from tars.deployment.models.deployments import TarsDeployment

        queryset = self.groups.all()
        all_ids = queryset.values_list('id', flat=True)
        deployments = TarsDeployment.objects.filter(group__in=all_ids)
        ids = list(deployments.values('group').annotate(max_id=models.Max('id'))
                   .values_list('max_id', flat=True))
        empty_group_ids = [i for i in all_ids if i not in ids]

        statuses = list(
            TarsDeployment.objects.filter(id__in=ids).values('status', 'id'))
        if empty_group_ids:
            statuses += [{'status': _.SUCCESS, 'id': i}
                         for i in empty_group_ids]
        return statuses

    def summarize_status(self):
        from tars.api.utils import parse_status
        statuses = set(s['status'] for s in self.summarize_group_status())
        return parse_status(statuses)


class Package(TimestampedModel):
    application = models.ForeignKey(
        Application, related_name='packages', db_constraint=False, null=True)
    name = models.CharField(max_length=255, null=True)
    version = models.CharField(max_length=255, null=True, blank=True)
    location = models.CharField(max_length=1023, null=True, blank=True)
    is_deleted = models.BooleanField(default=False)

    objects = SoftDeleteManager()

    class Meta:
        db_table = 'packages'

    def __unicode__(self):
        return '<Package %s>%s-%s' % (self.pk, self.application.name, self.version)

    @property
    def bundle_path(self):
        try:
            return urlparse(self.location).path.rsplit('/', 1)[-1]
        except Exception:
            raise PackageError('parse package {0} url path error'
                               .format(self.id))

    @property
    def latest_deployment(self):
        return self.deployments.latest('id')

    @property
    def container(self):
        try:
            return urlparse(self.location).netloc
        except Exception:
            raise PackageError('parse package {0} container error'
                               .format(self.id))

