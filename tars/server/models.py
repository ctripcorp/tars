import logging
import traceback
import itertools

from django.db import models, IntegrityError, transaction
from django.db.models import Q
from django.dispatch import receiver
from django.core.exceptions import ObjectDoesNotExist

from constance import config

from rest_client import get_salt_client
from roll_engine.constants import REVOKED
from roll_engine.exceptions import ActionNotAllowed, ActionFailed
from roll_engine.db import TimestampedModel, SoftDeleteManager

from .lb import choose_lb_facade
from .agency import choose_deploy_agency
from tars.deployment import constants
from tars.application.models import Application
from tars.exceptions import SyncError
from tars.utils import ConstantSet, InstanceScopePyringBean


logger = logging.getLogger(__name__)


class Server(TimestampedModel):
    hostname = models.CharField(max_length=255, null=True, blank=True)
    ip_address = models.CharField(max_length=64, null=True, blank=True)
    group = models.ForeignKey('Group', related_name='servers', null=True,
                              blank=True, db_constraint=False)
    is_fort = models.BooleanField(default=False)
    idc = models.CharField(max_length=255, null=True, blank=True)
    is_deleted = models.BooleanField(default=False, editable=False)
    objects = SoftDeleteManager()

    class Meta:
        db_table = 'servers'

    def __unicode__(self):
        return "<Server {}>{}".format(self.pk, self.hostname)

    def simple_download(self, container, path, local_path):
        salt = get_salt_client(self.group.application.salt_client)
        return salt.run_module(self.hostname, 'tars_utils.simple_download', 30,
                               container, path, local_path)

    def update(self, **kwargs):
        kwargs = {k: v for k, v in kwargs.items() if v is not None}
        Server.objects.filter(id=self.id).update(**kwargs)


class Group(TimestampedModel, InstanceScopePyringBean):
    """ Represent a CMS group """

    # constance
    G_TYPE_ENUM = ConstantSet('Ansible', 'join')

    # Fields
    name = models.CharField(max_length=255, null=True)
    application = models.ForeignKey(Application, related_name='groups',
                                    null=True, blank=True, db_constraint=False)
    vdir_path = models.CharField(max_length=255, null=True)
    physic_path = models.CharField(max_length=255, null=True, blank=True)
    fort = models.CharField(max_length=255, null=True, blank=True)   # will override server's is_fort
    idc = models.CharField(max_length=255, null=True, blank=True)
    health_check_url = models.CharField(max_length=255, null=True, blank=True)
    is_ssl = models.BooleanField(default=False)
    g_type = models.CharField(max_length=32, null=True, blank=True, default=G_TYPE_ENUM.Ansible)
    is_deleted = models.BooleanField(default=False, editable=False)
    objects = SoftDeleteManager()

    class Meta:
        db_table = 'groups'

    def __init__(self, *args, **kwargs):
        super(Group, self).__init__(*args, **kwargs)
        self._merge_deploys = None
        self.origin_g_type = self.g_type

    def __unicode__(self):
        return u"<Group {}>{}".format(self.pk, self.name)

    def get_delegation(self, *args, **kwargs):
        if self.g_type == self.G_TYPE_ENUM.join and self.__class__ != JoinedGroup:  # stop recursion
            return self.joinedgroup
        else:
            return self

    def save(self, *args, **kwargs):
        if (isinstance(self.vdir_path, basestring) and len(self.vdir_path) > 0
                and self.vdir_path[0] != '/'):
            self.vdir_path = '/{}'.format(self.vdir_path)

        if self.is_deleted:
            self.servers.update(is_deleted=True)  # clean servers of removed one

        super(Group, self).save(*args, **kwargs)

    def get_forts(self, valid_servers=None):
        if valid_servers is None:
            valid_servers = []

        queryset = default_qs = self.servers.order_by('hostname')
        if valid_servers:
            queryset = default_qs = queryset.filter(hostname__in=valid_servers)

        if self.fort is None:
            queryset = queryset.filter(is_fort=True)
        else:
            queryset = queryset.filter(hostname__exact=self.fort)
        if not queryset.exists():
            first_svr = default_qs.first()
            return [] if first_svr is None else [first_svr.hostname]
        return queryset.values_list('hostname', flat=True)

    forts = property(get_forts)

    def get_lb(self, extra_hints=None):
        """ give a slb facade instance bind to this group """
        facade_cls = choose_lb_facade(self, extra_hints)
        return facade_cls(self)

    def get_deploy_agency(self):
        return choose_deploy_agency(self)

    @property
    def merge_deploys(self):
        if not self._merge_deploys:
            self._merge_deploys = MergeDeploymentManager(self)
        return self._merge_deploys

    @property
    def rerollable_deployment_ids(self):
        rerollable_deployment_ids = self.merge_deploys.order_by('-created_at')\
            .filter(status=constants.SUCCESS, package__is_deleted=False)[:10]\
            .values_list('id', flat=True)

        return list(rerollable_deployment_ids)

    @property
    def rollback_deployment(self):
        try:
            latest_deployment = self.merge_deploys.latest()
        except ObjectDoesNotExist:
            rollback_deployment = None
        else:
            if (latest_deployment.flavor == latest_deployment.ROLLBACK and
                    latest_deployment.status == REVOKED):
                # rollback A fails and next rollback B actually should be the same purpose
                rollback_deployment = latest_deployment
            else:
                rollback_deployment = latest_deployment.parent

        if rollback_deployment is None:
            raise Exception('Application {0.application} group {0} has no '
                            'deployment can be used for rollback'.format(self))
        # Slice batches with MAX_PERCENTAGE for rollback deployment
        # so modify its batch_pattern
        rollback_deployment.config.batch_pattern = '50%'

        # re-assign group to self, cuz it may be a JoinedGroup
        rollback_deployment.group = self

        return rollback_deployment

    @property
    def current_deployment(self):
        queryset = self._running_deployments()

        if queryset.count() >= 1:
            return queryset.latest()
        else:
            return None

    def _running_deployments(self):
        return self.merge_deploys.exclude(status__in=constants.HALTED)

    @property
    def last_success_deployment(self):
        try:
            return self.merge_deploys.exclude(category="scaleout").filter(status=constants.SUCCESS).latest('id')
        except ObjectDoesNotExist:
            return None

    def sync_cms(self):
        return set(), set()

    def summarize_packages(self):
        '''
        Return dict indicates the server number grouped by their package version
        '''
        from tars.deployment.models import TarsDeploymentTarget

        latest_targets = [
            TarsDeploymentTarget.objects.filter(
                _hostname=h,
                batch__deployment__application=self.application,
                batch__deployment__status=constants.SUCCESS
            )
            .order_by('-updated_at').first()
            for h in self.servers.values_list('hostname', flat=True)
        ]

        packages_on_servers = [t.batch.deployment.package for t in latest_targets if t]

        ordered = sorted(packages_on_servers, lambda a, b: int(a.pk - b.pk))
        grouped = itertools.groupby(ordered)

        r = [(key, len(list(val_it))) for key, val_it in grouped]

        return r

    def rollback(self, deployment_id):
        # for XMON
        current_deployment = self.current_deployment
        if (current_deployment is not None and
                current_deployment.id == deployment_id):
            if current_deployment.is_braked():
                rollback_deployment = self.rollback_deployment

                try:
                    # reset deployment
                    rollback_deployment.pk = None
                    rollback_deployment.status = constants.PENDING
                    rollback_deployment.flavor = rollback_deployment.ROLLBACK

                    with transaction.atomic():
                        rollback_deployment.save()

                        # start to rollout immediately
                        rollback_deployment.start()
                except IntegrityError:
                    raise ActionFailed('Rollback failed for application {0}'
                                       .format(self.name))
                else:
                    return rollback_deployment
            else:
                raise ActionNotAllowed(
                    'This rollback api only works for braked deployment')
        else:
            raise ActionNotAllowed(
                'This rollback api is forbidden for deployment {0}'
                .format(deployment_id))

    def is_idle(self, rop_id):
        related_deps = self.merge_deploys.all()
        if self._running_deployments().exists():
            if rop_id is not None:
                if not related_deps.filter(rop_id=rop_id).exists():
                    failed_deps = related_deps.filter(
                        status=constants.FAILURE)
                    if failed_deps.exists():
                        return True
            return False
        else:
            if rop_id is not None:
                if rop_id != -255:
                    same_rop_deps = related_deps.filter(rop_id=rop_id)
                    if (same_rop_deps.exists() and
                            same_rop_deps.latest().status == constants.SUCCESS):
                        return False
                return True
            else:
                return False

    def fetch_batches(self, batch_pattern, flavor=None):
        from tars.deployment.models import TarsDeployment
        if flavor is None:
            flavor = TarsDeployment.STANDARD

        temp_deployment = TarsDeployment(
            application=self.application, group=self, flavor=flavor)
        return temp_deployment.preview_batches(batch_pattern)

    def precreate_deployment(self):
        for deployment in self.merge_deploys.exclude(
                status__in=constants.HALTED):
            deployment.trans(REVOKED)


class JoinedGroup(Group):
    """ Act as a super group which combines from multiple ones """

    # constants
    _MIRROR_FIELD_NAMES = ('site_name', 'vdir_path', 'app_pool_name', 'physic_path',
                           'business_port', 'shutdown_port', 'health_check_url')
    # position means it
    _JOIN_CRITERIA_MASKS = ['check_identical_server', 'check_identical_version']

    # django fields
    objects = SoftDeleteManager()
    aggregation = models.ManyToManyField(Group, related_name='contained_by',
                                         symmetrical=False,
                                         db_table='groups_joins_junction')

    class Meta:
        db_table = 'groups_joins'

    def __init__(self, *args, **kwargs):
        super(JoinedGroup, self).__init__(*args, **kwargs)
        self._join_group_servers_set = None

    def delete(self):
        self.is_deleted = True
        self.save()

    def save(self, *args, **kwargs):
        if not self.pk:
            assert self.application is not None, \
                "JoinedGroup must have a associated application"

            self.name = self.name or "joined_group_%s" % self.application.name
            self.g_type = Group.G_TYPE_ENUM.join
            self.site_name = None  # bypass super default site_name 'Ctrip'

        # call grandpa, bypass Group.save() logic
        super(Group, self).save(*args, **kwargs)


    def is_idle(self, rop_id):
        """ origin is_idle check merge_deploys (self and base) deployment, we
            need lock JoinedGroup when non-base sub-group starts a deploy
        """
        is_lock_caused_by_self_base_deploys = super(JoinedGroup, self).is_idle(rop_id)

        if is_lock_caused_by_self_base_deploys is False:
            return False
        else:
            for g in self.aggregation.all():
                if g.is_idle(rop_id) is False:
                    return False

        return True

    @property
    def servers(self):
        """ A hack to shadow origin servers to ensure upper-level API consistency. Instead
            of returing simple RelatedManager, a dynamic created custom server manager which
            contains servers of all aggregated groups will be returned
        """
        if not self._join_group_servers_set:
            self._join_group_servers_set = JoinedGroupServerManager(self)

        return self._join_group_servers_set

    ########################
    # meta handling
    ########################
    def rebuild_meta(self):
        # we trust and assume aggregation have same meta
        one = self.aggregation.first()
        if one is None:
            return

        for m_field in self._MIRROR_FIELD_NAMES:
            setattr(self, m_field, getattr(one, m_field))

        idc_set = set([g.idc for g in self.aggregation.all() if g.idc is not None])
        idc_count = len(idc_set)
        self.idc = idc_set.pop() if idc_count == 1 else "CROSS-IDC"

        self.save()

    def check_group_meta_is_identical(self, target):
        for v_field in self._MIRROR_FIELD_NAMES:
            my_meta = getattr(self, v_field)

            if my_meta is not None:
                assert my_meta == getattr(target, v_field), \
                    "Inconsist meta field '{}' found on {}".format(v_field, target)

    def check_identical_server(self, target):
        curr_server_union_set = set(self.servers.values_list("ip_address", flat=True))
        target_server_set = set(target.servers.values_list("ip_address", flat=True))
        overlapped_set = curr_server_union_set & target_server_set

        if overlapped_set:
            raise AttributeError("Cannot join overlapped groups, conjunction ip {}".format(overlapped_set))

    def check_identical_version(self, target):
        join_last = self.last_success_deployment
        target_last = target.last_success_deployment

        if join_last and target_last and join_last.package.version != target_last.package.version:
            raise AttributeError("Inconsist deploy package version, JoinedGroup: %s, Target: %s" % (self, target))

    ########################
    # expose APIs
    ########################
    def join(self, group, validation_switch_bitmap):
        """ absorb a group , do validation based on first aggregated """
        assert group.g_type != Group.G_TYPE_ENUM.join, "join a JoinedGroup is not allowed"
        assert group.application_id == self.application_id, \
            "Group {} should belongs to same app".format(group)

        self.check_group_meta_is_identical(group)

        # check if bitmap for each switch is on, run validation
        for position, func_name in enumerate(self._JOIN_CRITERIA_MASKS):
            if (1 << position) & validation_switch_bitmap:
                getattr(self, func_name)(group)

        self.aggregation.add(group)
        self.rebuild_meta()

    ################################
    # overrides for API consistency
    ################################
    def get_forts(self, valid_servers=None):
        return list(set(itertools.chain(*[g.get_forts(valid_servers) for g in self.aggregation.all()])))

    # FIXME: @dalang, what's the point of keep BOTH forts and get_forts in Group ????
    forts = property(get_forts)

    def sync_cms(self):
        # NOTE: union operation breaks servers order stability in single group sync
        # but it seems currently we do NOT use returing value under any circumstance
        added, removed = reduce(
            lambda accum, add_remove_set: (accum[0] | add_remove_set[0], accum[1] | add_remove_set[1]),
            [g.sync_cms() for g in self.aggregation.all()],
            (set(), set())
        )

        self.rebuild_meta()

        try:
            for g in self.aggregation.all():
                self.check_group_meta_is_identical(g)
        except AssertionError as e:
            logger.error(
                "Join Group sync found inconsist meta of concrete group {}: {}".format(g, e.message)
            )

        return added, removed


class JoinedGroupServerManager(Server._default_manager.__class__):

    def __init__(self, joined_group_instance):
        super(JoinedGroupServerManager, self).__init__()
        self.instance = joined_group_instance
        self.model = Server

    @property
    def core_q(self):
        # use Q represts group_id = xx OR group_id = yy,
        # improve performance, quicker than __in: filter(group__id__in=[xxx])
        NON_EXISTING_GROUP_ID = -2333

        group_ids = self.instance.aggregation.values_list('id', flat=True) or [NON_EXISTING_GROUP_ID]

        return reduce(
            lambda join_q, or_group_id: join_q | Q(group__id=or_group_id),
            group_ids,
            Q()
        )

    def verbose_all(self):
        """ return simple aggregation of sub group servers """
        qs = super(JoinedGroupServerManager, self).get_queryset()
        qs._add_hints(instance=self.instance)

        return qs.filter(self.core_q)

    def get_queryset(self):
        """ return servers of UNIQUE hostname, for normal JoinedGroup.object.get().servers.all() """
        # NOTE: here group_by is a Django private API, may break
        # Django sucks by not supporting group by/distinct single column, except using values()
        qs = self.verbose_all()
        qs.query.group_by = [('servers', 'hostname')]

        return qs


class MergeDeploymentManager(models.Manager):
    """ TarsDeployment manager for maintain group's deployments history, merge related groups
        history into a chain
    """

    def __init__(self, group):
        super(MergeDeploymentManager, self).__init__()
        self.instance = group
        from tars.deployment.models import TarsDeployment
        self.model = TarsDeployment

    def get_queryset(self):
        qs = super(MergeDeploymentManager, self).get_queryset()

        if isinstance(self.instance, JoinedGroup):
            # joined group's history based on first sub group's history, including
            # any joinedgroup associate with concrete already deleted
            first_sub_record = self.instance.aggregation.through.objects \
                .filter(joinedgroup_id=self.instance.id).order_by("id").first()

            if first_sub_record:
                legacy_joined_groups = self.instance.aggregation.through.objects \
                    .filter(group_id=first_sub_record.group_id)

                merge_ids = [first_sub_record.group_id] \
                            + [join_group.joinedgroup_id for join_group in legacy_joined_groups]
            else:
                merge_ids = []
        else:
            merge_ids = self.instance.contained_by.through.objects \
                .filter(group_id=self.instance.id).values_list("joinedgroup_id", flat=True)

        core_q = reduce(
            lambda join_q, g_id: join_q | Q(group_id=g_id),
            merge_ids,
            Q(group_id=self.instance.id)
        )

        return qs.filter(core_q).order_by('id')

