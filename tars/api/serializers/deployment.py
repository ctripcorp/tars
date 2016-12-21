import datetime

from django.db import IntegrityError, transaction
from django.utils.translation import ugettext_lazy as _

from constance import config
from rest_framework import serializers
from rest_framework.serializers import ValidationError

from tars.api.utils import cmp_attrs
from tars.application.models import Package
from tars.deployment.models import (
    TarsDeployment, TarsDeploymentConfig, TarsDeploymentBatch,
    TarsDeploymentTarget, TarsDeploymentAction)
from tars.deployment import constants
from .base import PaginatedSerializerMixin, DynamicFieldsModelSerializer
from .server import GroupSerializer, ServerSerializer, PackageSerializer


class DeploymentConfigSerializer(DynamicFieldsModelSerializer):

    class Meta:
        model = TarsDeploymentConfig

    def validate_batch_pattern(self, pattern_str):
        validator = self.Meta.model.deployment.related.model._meta\
            .batch_factory.validate_batch_pattern
        try:
            return validator(pattern_str)
        except Exception as e:
            raise ValidationError(e)


class DeploymentSerializer(PaginatedSerializerMixin,
                           DynamicFieldsModelSerializer):
    """ for tarsui related API """
    config = DeploymentConfigSerializer(required=True)
    package = serializers.PrimaryKeyRelatedField(
        required=True, style={'base_template': 'input.html'},
        queryset=Package.objects.all_with_deleted())
    running = serializers.SerializerMethodField('is_running')
    actions = serializers.SerializerMethodField()
    _class = serializers.SerializerMethodField()
    rerollable = serializers.SerializerMethodField('is_rerollable')
    flavor = serializers.ChoiceField(
        required=False,
        choices=[v for k, v in TarsDeployment.FLAVOR_CHOICES])
    braked = serializers.SerializerMethodField('is_braked')
    created_by = serializers.SerializerMethodField()

    class Meta:
        model = TarsDeployment
        read_only_fields = ('origin', 'parent',
                            'actions', 'created_at', 'updated_at')
        ignored_fields = ('actions',)
        extra_kwargs = {'rop_id': {'required': False},
                        'application': {'required': True},
                        'group': {'required': True}}
        _attrs_snapshot = {}

    def __init__(self, *args, **kwargs):
        super(DeploymentSerializer, self).__init__(*args, **kwargs)

        expand_package = self.context.get('expand_package', False)
        if expand_package:
            self.fields['package'] = PackageSerializer()
        expand_group = self.context.get('expand_group', False)
        if expand_group:
            self.fields['group'] = GroupSerializer(
                ignored_fields=('braked', 'last_success_package', 'server_num',
                                'packages', 'current_deployment'))

        self.rerollable_ids = self.context.get('rerollable_ids', None)
        if self.rerollable_ids is None:
            self.fields.pop('rerollable', None)

    def to_internal_value(self, data):
        id = data.get('id', None)
        ret = super(DeploymentSerializer, self).to_internal_value(data)
        ret[u'id'] = id
        return ret

    def to_representation(self, obj):
        obj.flavor = obj.get_flavor_display()
        result = super(DeploymentSerializer, self).to_representation(obj)
        return result

    def create(self, validated_data):
        request = self.context.get('request')
        try:
            with transaction.atomic():
                config = validated_data.get('config')
                config.save()
                deployment = TarsDeployment.objects.create(
                    **validated_data)
        except IntegrityError as e:
            self.Meta._attrs_snapshot = {}
            raise ValidationError(e)
        else:
            self.Meta._attrs_snapshot = {}
            operator = getattr(request.user, 'username', '')
            deployment.actions.create(action='create', message='new deployment',
                                      operator=operator)
            return deployment

    def update(self, instance, validated_data):
        immutable_fields = ('config', 'application', 'package')
        for field in immutable_fields:
            validated_data.pop(field, None)

        return super(
            DeploymentSerializer, self).update(instance, validated_data)

    def is_running(self, obj):
        return obj.is_running()

    def is_rerollable(self, obj):
        return obj.id in self.rerollable_ids

    def is_braked(self, obj):
        return obj.is_braked()

    def get_actions(self, obj):
        return obj.next_user_actions()

    def get__class(self, obj):
        return obj.__class__.__name__

    def get_created_by(self, obj):
        return obj.actions.get(action="create").operator

    def validate_config(self, config):
        serializer = DeploymentConfigSerializer(data=config)
        if not serializer.is_valid():
            raise ValidationError(serializer.errors)
        return serializer.Meta.model(**serializer.data)

    def validate_package(self, pkg):
        if pkg.is_deleted:
            raise ValidationError(
                '{} has been disabled, may be caused by rollback'.format(pkg))

        return pkg

    def validate_flavor(self, flavor):
        return TarsDeployment.get_internal_flavor(flavor)

    def validate_status(self, status):
        if status is not None and not hasattr(constants, status):
            raise ValidationError(
                '{} is not an available status'.format(status))
        return status

    def _validate_orig_deployment(self, id):
        """
        if 'id' field is found in request body, we assume the new deployment is
        derived by an old deployment, treat as original_deployment, and the rop
        of the original deployment will be reused.
        """
        if id is None:
            return None

        try:
            orig_deployment = TarsDeployment.objects.get(id=id)
        except TarsDeployment.DoesNotExist:
            raise ValidationError(
                {'id': 'no original deployment matched {}'.format(id)})
        else:
            return orig_deployment

    def _validate_rop_id(self, rop_id, original_deployment, group):
        # check if other deployment on the same group is running
        return rop_id
        if original_deployment is not None:
            return original_deployment.rop_id
        elif 'uat' in config.ENV:
            # disable single success deploy restriction
            return rop_id
        else:
            if not group.is_idle(rop_id):
                if (getattr(group.current_deployment,
                            'category', None) == 'scaleout'):
                    err_msg = 'a scaleout deployment is running now'
                else:
                    application = group.application
                    err_msg = ('group {0} of application {1.id} [{1.name}] is not idle for rop id {2}'.format(
                                group.id, application, rop_id))
                raise ValidationError({'rop_id': err_msg})
            return rop_id

    def _validate_group(self, group, application):
        def invalid_hostname(value):
            return value is None or value == ''

        def invalid_ip_address(value):
            return value is None or value == ''

        group = group or application.groups.first()

        if group is None:
            raise ValidationError(
                {'group': 'application {} has no group'.format(application)})

        if not application.groups.filter(id=group.id).exists():
            err_msg = 'Avaliable groups for application {}: {}'\
                .format(application.name,
                        application.groups.values_list('id', flat=True))
            raise ValidationError({'group': err_msg})

        server_infos = group.servers.all().values(
            'id', 'hostname', 'ip_address')
        invalid_servers = filter(
            lambda x: invalid_hostname(x['hostname']) or invalid_ip_address(
                x['ip_address']), server_infos)
        if invalid_servers:
            err_msg = "Invalid hostname or ip_address for server in list {}"\
                .format(invalid_servers)
            raise ValidationError({'group': err_msg})

        return group

    def _validate_application(self, flavor, application):
        """
        in incre-deploy mode, we should never rollback as it indeed CANNOT.
        """
        if application.container in constants.INCRE_DEPLOY_CONTAINER \
                and flavor != TarsDeployment.STANDARD:
            raise ValidationError('Sorry, Incremental deployment does NOT '
                                  'support ROLLBACK or REROLL.')

        return application

    def validate(self, attrs):
        application = attrs.get('application')
        rop_id = attrs.get('rop_id')
        group = attrs.get('group')
        orig_deployment_id = attrs.pop('id', None)
        flavor = attrs.get('flavor')
        config = attrs.get('config')

        if flavor == TarsDeployment.ROLLBACK:
            config.pause_time = 0

        request = self.context.get('request')

        orig_deployment = self._validate_orig_deployment(orig_deployment_id)
        attrs['application'] = self._validate_application(flavor, application)
        attrs['group'] = self._validate_group(group, application)

        # check if same rop is deploying
        attrs['rop_id'] = self._validate_rop_id(rop_id, orig_deployment, group)

        # prevent from submiting request with same data in succession
        last_attrs = self.Meta._attrs_snapshot
        if cmp_attrs(last_attrs, attrs):
            self.Meta._attrs_snapshot = {}
            raise ValidationError('do NOT submit twice')
        else:
            self.Meta._attrs_snapshot = attrs

        return attrs


class DeploymentSerializer4UAT(DeploymentSerializer):
    """ for simply_roll only """
    config = DeploymentConfigSerializer(required=False)

    class Meta:
        model = TarsDeployment
        _attrs_snapshot = {}
        read_only_fields = ('origin', 'parent',
                            'actions', 'created_at', 'updated_at')
        ignored_fields = ('actions',)
        extra_kwargs = {'application': {'required': True},
                        'rop_id': {'required': False},
                        'group': {'required': False},
                        }

    def to_internal_value(self, data):
        if 'config' not in data:
            data['config'] = {
                'batch_pattern': "50%",
                'pause_time': 0,
                'verify_timeout': 0,
                'startup_timeout': 0,
                'restart_app_pool': False,
            }

        if 'category' not in data:
            data['category'] = "simply_roll"

        return super(DeploymentSerializer4UAT, self).to_internal_value(data)


class DeploymentSummarySerializer(serializers.BaseSerializer):
    def to_representation(self, obj):
        def dump_fort(server):
            serializer = ServerSerializer(server,
                                          fields=('hostname', 'ip_address'))
            return serializer.data

        app = obj.application
        # old deployment is not created in group granularity
        group = obj.group or app.groups.first()

        batch_list = obj.batches.all().order_by('index')
        batch_serializer = DeploymentBatchSerializer(
            batch_list, many=True, ignored_fields=tuple(),
            fields=('id', 'index', 'fort_batch', 'status', 'summary'))

        try:
            fort_batch = obj.get_fort_batch()
            fort_servers = [tgt.server for tgt in fort_batch.targets.all()]
        except AttributeError:
            fort_servers = []

        forts = map(dump_fort, fort_servers)
        formatted_group = GroupSerializer(
            group, fields=('id', 'site_name', 'health_check_url')).data
        formatted_group.update(fort=next(iter(forts), None),
                               batches=batch_serializer.data)
        return dict(id=obj.id, application=app.id, groups=[formatted_group])


class DeploymentBatchSerializer(PaginatedSerializerMixin,
                                DynamicFieldsModelSerializer):
    fort_batch = serializers.SerializerMethodField('is_fort_batch')
    summary = serializers.SerializerMethodField()

    class Meta:
        model = TarsDeploymentBatch
        ignored_fields = ('summary',)

    def is_fort_batch(self, obj):
        return obj.is_fort_batch()

    def get_summary(self, obj):
        return obj.summarize_targets()


class DeploymentTargetSerializer(PaginatedSerializerMixin,
                                 DynamicFieldsModelSerializer):
    server = ServerSerializer(read_only=True)
    hostname = serializers.CharField()
    ip_address = serializers.CharField()

    class Meta:
        model = TarsDeploymentTarget
        ignored_fields = ('_hostname', '_ip_address')


class DeploymentActionSerializer(DynamicFieldsModelSerializer):

    class Meta:
        model = TarsDeploymentAction
