import logging, operator, json, time, itertools
from datetime import timedelta, date

from django.db import models, IntegrityError
from django.db.models.signals import post_save
from django.dispatch import receiver

try:
    from rest_client import get_tracker_client
    from django.core import serializers as django_serializers
    HAS_TRACKER = True
except ImportError:
    HAS_TRACKER = False

from constance import config
from roll_engine.models import Deployment, FortMixin
from roll_engine.factory import BatchFactory
from roll_engine.constants import REVOKED
from roll_engine.exceptions import DeploymentError
from rest_client.exceptions import SLBClientError
from rest_client import (get_es_client, get_salt_client)


from tars.application.models import Application, Package
from tars.deployment import constants
from tars.deployment.tasks import TarsTasks
from tars.deployment.mixins import JobWSMixin, TrackerMixin
from tars.server.models import Group
from tars.exceptions import TarsError
from .configs import TarsDeploymentConfig

from tars.utils import AdvancedPolymorph

logger = logging.getLogger(__name__)


class TarsFactory(BatchFactory):
    def generate_deployment_targets(self, deployment_batch, batch_servers):
        """
        Override to add server_id field to deployment target
        """
        kwargs = dict(batch=deployment_batch, status=constants.PENDING)
        if deployment_batch.is_fort_batch():
            kwargs.update(is_fort=True)
        target_model = deployment_batch.targets.model
        target_model.objects.bulk_create(
            target_model(server_id=svr['id'], hostname=svr['hostname'],
                         ip_address=svr['ip_address'], **kwargs)
            for svr in batch_servers)


class JoinGroupBatchFactory(TarsFactory):
    """ Special unit to implement join group batching algorithm """

    def slice_servers(self, percentages, d_servers, fort_hostnames):
        """ d_servers is dict values of servers, percentages is a list of int """

        # group up a messy bunch of servers by srv.group.id
        uniform_percentage = percentages.pop(0) if percentages else 25

        server_stew = [svr for svr in d_servers if svr['hostname'] not in fort_hostnames]

        unique_groups_involve = list(set([srv['group_id'] for srv in server_stew]))

        # bucket dict, key = g_id, value = list of servers in group
        bucket = {g_id: [s for s in server_stew if s['group_id'] == g_id] for g_id in unique_groups_involve}

        non_fort_slices = JoinGroupBatchFactory.run_brunt_mix_batch_algorithm(bucket, uniform_percentage)

        if fort_hostnames:
            # aggregate forts on hostname
            fort_dict = {f_host: [srv for srv in d_servers if srv['hostname'] == f_host] for f_host in fort_hostnames}
            fort_slice = [srv_li[0] for srv_li in fort_dict.values()]
            return [fort_slice] + non_fort_slices
        else:
            return non_fort_slices

    @staticmethod
    def run_brunt_mix_batch_algorithm(g_bucket, per_limit):
        """ Given a dict of groups containing servers which might be redundent across
            groups, output a list of variety length slices(batches) where single slice
            will not exceed a max percentage for each group.
        """
        batch_slices = []
        relieved = []

        # duplicate bucket as algorithm is unstable, g_bucket should not be modified
        working_bucket = g_bucket.copy()
        for g_id, srvs in working_bucket.iteritems():
            working_bucket[g_id] = srvs[:]

        # start process, one cycle to generate one batch, until all servers are done
        while len(working_bucket) > 0:

            per_batch = {}  # each slice is a g_id:pull server dict

            # scan each bucket
            for g_id, bucket_srvs in working_bucket.items():

                # try to allocate each server
                for _ in range(len(bucket_srvs)):
                    candidate = bucket_srvs.pop(0)  # pop left side, increase relieve odds

                    if candidate['hostname'] in relieved:
                        # consume and continue when this server is allocated
                        continue

                    # pre-allocate server into per_batch, check if trigger limit
                    if g_id in per_batch:
                        per_batch[g_id].append(candidate)
                    else:
                        per_batch[g_id] = [candidate]

                    if JoinGroupBatchFactory.will_trigger_limit(per_batch, g_bucket, per_limit):
                        # put back into server queue, unwind pre-allocate
                        bucket_srvs.append(candidate)
                        per_batch[g_id].pop()
                        continue

                    # if all good, keep server in current batch, mark as allocated
                    relieved.append(candidate['hostname'])

                # cleanup empty bucket, if ones' servers are all consumed
                if len(bucket_srvs) == 0:
                    working_bucket.pop(g_id)

            # end for loop, done a batch. concat group dict into server list
            batch_slices.append(sum(per_batch.values(), []))

        return batch_slices

    @staticmethod
    def will_trigger_limit(tb_pulled_bucket, g_bucket, per_limit):

        assert type(per_limit) == int, "per_limit given should be int"

        tb_pulled_hosts = [srv['hostname'] for srv in sum(tb_pulled_bucket.values(), [])]

        # ensure per batch get at least one target
        if len(tb_pulled_hosts) == 1:
            return False

        for g_id, srvs in g_bucket.iteritems():
            matched_tb_pulled = [s for s in srvs if s['hostname'] in tb_pulled_hosts]
            if len(matched_tb_pulled) > len(srvs) * (per_limit/100.0):
                return True

        return False


class TarsDeployment(TrackerMixin, Deployment):
    STANDARD = 0
    REROLL = 1
    ROLLBACK = 2
    FLAVOR_CHOICES = (
        (STANDARD, 'rollout'),
        (REROLL, 'reroll'),
        (ROLLBACK, 'rollback'),
    )

    category = models.CharField(max_length=20, null=True,
                                blank=True, default="normal")
    config = models.ForeignKey(TarsDeploymentConfig, db_constraint=False,
                               null=True, related_name='deployment')
    application = models.ForeignKey(Application, related_name='deployments',
                                    db_constraint=False, null=True)
    package = models.ForeignKey(Package, related_name='deployments',
                                db_constraint=False, null=True)
    group = models.ForeignKey(Group, related_name='deployments',
                              db_constraint=False, null=True)
    rop_id = models.IntegerField(null=True, db_index=True)
    flavor = models.IntegerField(choices=FLAVOR_CHOICES, default=STANDARD)
    origin = models.ForeignKey(
        'self', related_name='+', db_constraint=False, null=True)
    parent = models.ForeignKey(
        'self', related_name='+', db_constraint=False, null=True)

    class Meta(Deployment.Meta):
        db_table = 'deployments'
        get_latest_by = 'created_at'
        batch_factory = TarsFactory(max_percentage=50)
        task_set = TarsTasks

    @staticmethod
    def has_forts(deployment_class):
        return issubclass(deployment_class, FortMixin)

    def get_object(self):
        kwargs = dict(env=config.ENV, category=self.category)
        subclass_name = AdvancedPolymorph.get_decision('deploy', **kwargs)

        if self.application.ignore_fort or self.flavor == self.ROLLBACK:
            subclass_name = subclass_name.replace('Fort', '')

        if self.group.g_type == Group.G_TYPE_ENUM.join:
            subclass_name += 'Join'

        try:
            subclass = globals()[subclass_name]
        except KeyError:
            raise TarsError('{} is undefined Deployment'.format(subclass_name))

        self.__class__ = subclass
        return self

    def __init__(self, *args, **kwargs):
        super(TarsDeployment, self).__init__(*args, **kwargs)
        self._slb_client = None
        self._agency = None

    @staticmethod
    def get_internal_flavor(flavor_display):
        for k, v in TarsDeployment.FLAVOR_CHOICES:
            if v == flavor_display:
                return k
        else:
            raise TarsError('Invalid flavor {0}'.format(flavor_display))

    @property
    def rollback_deployments(self):
        rollback_deployment = self.parent
        rollback_deployment_ids = []

        while rollback_deployment is not None:
            rollback_deployment_ids.append(rollback_deployment.id)
            rollback_deployment = rollback_deployment.parent
        return TarsDeployment.objects.filter(id__in=rollback_deployment_ids)\
            .order_by('-id')

    @property
    def targets(self):
        from .targets import TarsDeploymentTarget

        targets = reduce(operator.or_,
                         [batch.targets.all()
                          for batch in self.batches.all()],
                         TarsDeploymentTarget.objects.none())
        return targets

    @property
    def slb_client(self):
        # lazy load, cache a facade slb
        if not self._slb_client:
            extra_hints = {'category': self.category}
            self._slb_client = self.group.get_lb(extra_hints)

        return self._slb_client

    @property
    def agency(self):
        if not self._agency:
            self._agency = self.group.get_deploy_agency()

        return self._agency

    def salt_client_and_module(self):
        app = self.application
        client = get_salt_client(app.salt_client)
        module = app.salt_module
        return client, module

    def log_index(self, dt=None):
        if dt is None:
            dt = self.created_at.date()

        monday_date = dt - timedelta(days=dt.weekday())
        return 'tars{0}-{1}'.format(getattr(config, 'LOG_ENV', ''), monday_date)

    def log_callback(self, log):
        try:
            get_es_client().index(
                index=self.log_index(date.today()),
                doc_type='controller', body=log
            )
        except Exception as e:
            raise

        self.send_tracker_event(log)

    def build_deployment_log(self, deployment_target=None, operator=None):
        log_extra = super(TarsDeployment, self)\
            .build_deployment_log(deployment_target, operator)
        app = self.application
        log_extra['app_id'] = app.id
        log_extra['organization'] = app.organization
        if deployment_target is not None:
            log_extra['deploy_target_ip'] = deployment_target.server.ip_address
        return log_extra

    def servers_to_be_deployed(self):
        """ impl interface to provide servers for _create_batch """
        if self.group is None:
            return []

        if self.group.g_type == Group.G_TYPE_ENUM.join:
            batching_servers = self.group.servers.verbose_all()
        else:
            batching_servers = self.group.servers.all()

        return self._reorder_servers_by_status_for_batch(batching_servers)

    def _reorder_servers_by_status_for_batch(self, servers):
        """ mix down and active servers equally distributed """
        try:
            slb_group_status = self.slb_client.summarized_group_server_statuses()
            server_down_svrs = []
            pulled_svrs = []

            if slb_group_status:
                server_down_svrs = slb_group_status['server'][False]
                pulled_svrs = self.slb_client.pulled_servers()

        except SLBClientError as e:
            logger.exception(e)
            raise e
        except KeyError as e:
            raise TarsError('Parse SLB response error {}'.format(e))

        if server_down_svrs:
            servers = servers.exclude(ip_address__in=server_down_svrs)
            logger.warn('filter out servers {} whose member status down'.format(server_down_svrs))

        if not servers.exists():
            raise TarsError('no server to be batched or all servers are physical down')

        # make disabled and enabled ones interpolated, in case that all active servers
        # are batched into one and pulled out under certain circumstances
        disabled_svrs = servers.exclude(ip_address__in=pulled_svrs).values()
        enabled_svrs = servers.filter(ip_address__in=pulled_svrs).values()

        # the whole process is a func(x) mapping a smaller set into a bigger set, which is
        # very similar to slicing servers into batches
        shorter_one = min(enabled_svrs, disabled_svrs, key=len)
        longer_one = disabled_svrs if shorter_one is enabled_svrs else enabled_svrs

        chunk_num = len(shorter_one) or 1
        chunk_size = int(len(longer_one)/chunk_num)

        chunks = [longer_one[i: i + chunk_size] for i in range(0, len(longer_one), chunk_size)]

        for i, x in enumerate(shorter_one):
            chunks[i].append(x)

        return list(itertools.chain(*chunks))

    def set_rollback_meta(self):
        """ there is a premise that use won't roll twice+ on a same package, violation
            maybe cause continuously rollback failure. check wiki for more
        """
        last_succ_deploy = self.group.last_success_deployment

        if last_succ_deploy is None:
            return

        if self.flavor == self.ROLLBACK:

            # 'origin' indicates which deployment triggers rollback, or rollback from
            origin = self.group.merge_deploys.latest()
            self.origin = origin

            # rollback acts diff when origin success or fail, when origin is scaleout or not,
            # when origin is rollback or not.
            # * if standard deploy A- succ, rollback A should rolls to last_succ_deploy.parent, set A's parent
            # to last_succ_deploy.parent.parent
            # * scaleout's rollback always rolls to last_succ_deploy.parent, whether scaleout succ or fail
            # * special case, if standard deploy A- fails, rollback should rolls to last_succ_deploy
            is_origin_fail = origin.status != constants.SUCCESS and \
                                origin.flavor == TarsDeployment.STANDARD and \
                                origin.category != "scaleout"

            if is_origin_fail:
                self.parent = last_succ_deploy.parent
            else:
                self.parent = getattr(last_succ_deploy.parent, 'parent', None)


        elif self.flavor == self.REROLL:
            self.parent = last_succ_deploy.parent

        else:
            # for standard rollout
            # as scaleout rolls the same version, we logically squash scaleouts and its base into one in
            # deploy history, by setting following scaleouts' parent same as their base's parent
            self.parent = last_succ_deploy if self.category != "scaleout" else last_succ_deploy.parent


    def save(self, *args, **kwargs):
        if self.pk is None:
            if self.category is None:
                self.category = self._meta.get_field('category').default

            self.set_rollback_meta()
            self.group.precreate_deployment()  # aka hook before_create_deployment
        try:
            super(TarsDeployment, self).save(*args, **kwargs)
        except DeploymentError as e:
            raise IntegrityError('{}, may due to slb server status'.format(e))

    def update_batches(self):
        self.group.sync_cms()

        for batch in self.batches.all():
            batch.update_batch()

        server_hostnames = self.targets.values_list('_hostname', flat=True)
        unbounded_servers = self.group.servers.exclude(hostname__in=server_hostnames)

        if unbounded_servers:
            max_idx = self.batches.aggregate(models.Max('index')).get(
                'index__max', 0)
            batch_class = self.batches.model
            batch = batch_class.objects.create(deployment=self, index=max_idx+1)
            batch.build_deployment_target(unbounded_servers)

    def is_running(self):
        return self.status not in constants.HALTED

    def is_braked(self):
        return self.status in constants.BRAKED

    def trans(self, action=None):
        super(TarsDeployment, self).trans(action)

        # recover deleted package cuz rollback failed
        if self.flavor == self.ROLLBACK and action == REVOKED:
            self.parent = self.origin.parent
            self.save()

            # recover disabled package when rollback revoked
            deployment = self.origin
            while ((deployment.flavor == self.REROLL or
                    deployment.status == REVOKED) and
                   deployment.origin is not None):
                deployment = deployment.origin
            disabled_package = deployment.package
            disabled_package.is_deleted = False
            disabled_package.save()

    def preview_batches(self, batch_pattern):
        has_forts = isinstance(self, FortMixin)
        factory = self._meta.batch_factory
        batch_pattern_str = factory.validate_batch_pattern(batch_pattern)
        forts = self.group.forts if has_forts else []
        target_list = self.group.servers.all().values()
        sliced_tgt_list = factory.preview_slice(batch_pattern_str,
                                                target_list, forts)
        formated_result = [{'count': len(svrs), 'is_fort': has_forts and i == 0}
                           for i, svrs in enumerate(sliced_tgt_list)]
        return (batch_pattern_str, formated_result)


class TarsFortDeployment(FortMixin, TarsDeployment):
    class Meta:
        proxy = True
        smoke_success_status = constants.VERIFY_SUCCESS

    def get_forts(self, valid_servers=None):
        return self.group.get_forts(valid_servers)


class TarsDeployment4UAT(TarsDeployment):
    class Meta:
        proxy = True
        batch_factory = TarsFactory(max_percentage=100)

    def save(self, *args, **kwargs):
        if self.pk is None:
            for deployment in self.group.deployments.exclude(
                    status__in=constants.HALTED):
                deployment.revoke()
        super(TarsDeployment4UAT, self).save(*args, **kwargs)

    def _reorder_servers_by_status_for_batch(self, servers):
        """ special process for Erlang app whose VM requires a certain start order
            normally UAT has no fort, here use group.fort which is deprecated by CMS
        """
        servers = super(TarsDeployment4UAT, self)._reorder_servers_by_status_for_batch(servers)

        first_start_host = self.group.fort

        if first_start_host:
            try:
                server_index = [s['hostname'] for s in servers].index(first_start_host)
                server = servers.pop(server_index)
                servers.insert(0, server)
            except ValueError:
                logger.error("%s group.fort is not in current servers, possibly outdated" % self.group.id)

        return servers


#####
# for Joined Group
#####
class JoinedGroupDeploymentOverride(object):

    CLONE_CATEGORY = "join_dummy"

    class Meta(TarsDeployment.Meta):
        proxy = True
        batch_factory = JoinGroupBatchFactory(max_percentage=50)
        task_set = TarsTasks

    ############## overrides ###############
    def preview_batches(self, batch_pattern):
        # TODO: refactor Group.preview_batches(), remove duplicate dirty quick code
        has_forts = isinstance(self, FortMixin)
        factory = self._meta.batch_factory
        batch_pattern_str = factory.validate_batch_pattern(batch_pattern)
        forts = self.group.forts if has_forts else []
        target_list = self.group.servers.verbose_all().values()
        sliced_tgt_list = factory.preview_slice(batch_pattern_str,
                                                target_list, forts)
        formated_result = [{'count': len(svrs), 'is_fort': has_forts and i == 0}
                           for i, svrs in enumerate(sliced_tgt_list)]
        return (batch_pattern_str, formated_result)


class TarsDeploymentJoin(JoinedGroupDeploymentOverride, TarsDeployment):
    pass

class TarsFortDeploymentJoin(JoinedGroupDeploymentOverride, TarsFortDeployment):
    pass

class TarsDeployment4UATJoin(JoinedGroupDeploymentOverride, TarsDeployment4UAT):
    pass


@receiver(post_save)
def deal_rollback(sender, instance, created, **kwargs):
    if not issubclass(sender, TarsDeployment):
        return

    if created and instance.flavor == instance.ROLLBACK:

        pre_deployment = instance.origin
        if pre_deployment is not None:
            while (pre_deployment.origin is not None and
                   pre_deployment.origin.parent == pre_deployment.parent):
                pre_deployment = pre_deployment.origin
            if (pre_deployment.status == constants.SUCCESS or
                    pre_deployment.flavor == pre_deployment.STANDARD):
                pre_deployment.package.is_deleted = True
                pre_deployment.package.save()
