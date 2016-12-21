from django.db import models

from rest_client.exceptions import SLBClientError
from roll_engine.utils.log import get_logger
from roll_engine.models import DeploymentBatch, FortMixin

from tars.deployment.constants import PENDING, SUCCESS
from tars.server.models import Group
from .deployments import TarsDeployment

es_logger = get_logger()

_SIMPLE_BATCH_CATEGORY_SPELL_ROUTING = (
    lambda b: 'Fort' if b.index == DeploymentBatch.FORT_INDEX and isinstance(b.deployment, FortMixin) else "",
    lambda b: 'Join' if b.deployment.group.g_type == Group.G_TYPE_ENUM.join else ""  # FIXME: use __class__.__name__
)


class TarsDeploymentBatch(DeploymentBatch):
    deployment = models.ForeignKey(TarsDeployment, related_name='batches',
                                   db_constraint=False, null=True)

    class Meta:
        db_table = 'deployment_batches'
        verbose_name_plural = 'deployment batches'

    def get_object(self):
        impl_name = "TarsDeployment%sBatch" % "".join([f(self) for f in _SIMPLE_BATCH_CATEGORY_SPELL_ROUTING])
        self.__class__ = globals()[impl_name]
        return self

    def __unicode__(self):
        return unicode(self.id)

    def need_pause(self):
        return self.index != self.deployment.FORT_INDEX + 1

    def is_fort_batch(self):
        deployment = self.deployment
        return self == getattr(deployment, 'get_fort_batch', lambda: None)()

    def summarize_targets(self):
        return reduce(
            lambda x, y: x.__setitem__(y.status, x.get(y.status, 0)+1) or x,
            self.targets.all(), {})

    def is_reach_up_server_threshold(self):
        deployment = self.deployment

        if deployment.category == 'scaleout':
            return False

        try:
            pulled_up_servers = deployment.slb_client.pulled_servers()
        except SLBClientError as e:
            es_logger.error(str(e), extra=deployment.extras)
            return True  # halt batch deployment if calling slb service failed

        target_ips = self.targets.values_list('server__ip_address', flat=True)

        return not self.run_online_minimum_policy(
            len(pulled_up_servers),
            len([s for s in target_ips if s in pulled_up_servers])
        )

    def run_online_minimum_policy(self, online_count, tb_pull_count):
        if 0 <= online_count < 2:
            return True  # always pass whenever upped server too few

        elif online_count < 4:
            if online_count - tb_pull_count >= 1:
                return True
            else:
                return False

        else:
            batch_pattern = self.deployment.config.batch_pattern
            ratio = float(batch_pattern[:batch_pattern.find('%')])
            ratio = 25 if ratio < 25 else ratio

            if online_count - tb_pull_count >= int(online_count*(100-ratio)/100):
                return True
            else:
                return False

    def is_all_targets_succeed(self):
        non_success_targets = self.targets.exclude(status=SUCCESS)
        return not non_success_targets.exists()

    def build_deployment_target(self, servers):
        target_class = self.targets.model
        kwargs = dict(batch=self, status=PENDING)
        return target_class.objects.bulk_create(
            target_class(server=svr, _hostname=svr.hostname,
                         _ip_address=svr.ip_address, **kwargs) for svr in servers)

    def update_batch(self):
        if self.status != SUCCESS:
            group = self.deployment.group
            servers = group.servers.values_list('hostname', flat=True)
            former_batches = self.deployment.batches.filter(index__lt=self.index)
            targets_in_former_batches = reduce(
                lambda x, y: x+list(y.targets.all().values_list('_hostname', flat=True)),
                former_batches, [])
            removed_targets = self.targets.exclude(_hostname__in=servers) | \
                self.targets.filter(_hostname__in=targets_in_former_batches)
            removed_targets.update(is_deleted=True)


class TarsDeploymentFortBatch(TarsDeploymentBatch):
    class Meta:
        proxy = True

    def is_fort_batch(self):
        return True

    def update_batch(self):
        if self.status != SUCCESS:
            group = self.deployment.group
            new_forts = set(self.deployment.group.forts)
            old_forts = set(
                self.targets.all().values_list('_hostname', flat=True))

            added_forts = new_forts.difference(old_forts)
            removed_targets = old_forts.difference(new_forts)

            if added_forts:
                target_class = self.targets.model
                for server in group.servers.filter(hostname__in=added_forts):
                    kwargs = {'server': server, 'status': PENDING,
                              'is_fort': True, '_ip_address': server.ip_address}
                    target_class.objects.all_with_deleted().update_or_create(
                        batch=self, _hostname=server.hostname, defaults=kwargs)

            if removed_targets:
                self.targets.filter(_hostname__in=removed_targets)\
                    .update(is_deleted=True)


class JoinedGroupUpServerPolicyMixin(object):

    def is_reach_up_server_threshold(self):
        deployment = self.deployment

        if deployment.category == 'scaleout':
            return False

        target_ips = self.targets.values_list('server__ip_address', flat=True)
        deploy_hints = {'category': deployment.category}

        # check batch to be pulled targets against each group's current slb status
        for g in deployment.group.aggregation.all():
            slb_upped_ips = g.get_lb(deploy_hints).pulled_servers()
            batch_pulling_out_ips = [s for s in target_ips if s in slb_upped_ips]

            if not self.run_online_minimum_policy(len(slb_upped_ips), len(batch_pulling_out_ips)):
                # if any runs on group aggregation fails, brake
                es_logger.error(
                    "pulling out '%s' breaks sub group %s minimum alive count" % (batch_pulling_out_ips, g.id),
                    extra=deployment.extras
                )

                return True

        return False


class TarsDeploymentJoinBatch(JoinedGroupUpServerPolicyMixin, TarsDeploymentBatch):
    class Meta:
        proxy = True


class TarsDeploymentFortJoinBatch(JoinedGroupUpServerPolicyMixin, TarsDeploymentFortBatch):
    class Meta:
        proxy = True
