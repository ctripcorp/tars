from django.db import transaction
from rest_framework import serializers

from .base import IPv4AddressField, PkModelField, PaginatedSerializerMixin, \
                  DynamicFieldsModelSerializer
from tars.api.utils import str2int
from tars.server.models import Server, Group, JoinedGroup
from tars.deployment.models import TarsDeploymentTarget
from tars.application.models import Package


class PackageSerializer(PaginatedSerializerMixin, DynamicFieldsModelSerializer):

    latest_deployment = serializers.SerializerMethodField()

    class Meta:
        model = Package
        ignored_fields = ('latest_deployment',)

    def get_latest_deployment(self, obj):
        latest_deployment = obj.latest_deployment
        if latest_deployment is not None:
            from .deployment import DeploymentSerializer
            serializer = DeploymentSerializer(latest_deployment)
            return serializer.data
        else:
            return None


class ServerSerializer(PaginatedSerializerMixin, DynamicFieldsModelSerializer):
    target = serializers.SerializerMethodField('get_deployment_target')

    class Meta:
        model = Server

    def __init__(self, *args, **kwargs):
        super(ServerSerializer, self).__init__(*args, **kwargs)
        hide_target = self.context.get('hide_target', True)

        if hide_target:
            self.fields.pop('target', None)

    def get_deployment_target(self, obj):
        targets = self.context.get('targets', [])
        server_id = obj.id

        for tgt in targets:
            if tgt['server_id'] == server_id:
                tgt_id = tgt['id']
                target = TarsDeploymentTarget.objects\
                    .filter(id=tgt_id).first()
                if target is not None:
                    from .deployment import DeploymentTargetSerializer
                    serializer = DeploymentTargetSerializer(
                        target, fields=('id', 'is_fort', 'status'))
                    data = serializer.data
                    data.update(index=target.batch.index)
                    return data
                break
        else:
            return None


class GroupSerializer(PaginatedSerializerMixin,
                      DynamicFieldsModelSerializer):
    servers = ServerSerializer(read_only=True, many=True,
                               fields=('hostname', 'ip_address', 'idc'))
    server_num = serializers.SerializerMethodField()
    packages = serializers.SerializerMethodField()
    current_deployment = serializers.SerializerMethodField()
    rollbackable = serializers.SerializerMethodField('is_rollbackable')
    last_success_package = serializers.SerializerMethodField()
    braked = serializers.SerializerMethodField('is_braked')
    forts = serializers.ListField(child=serializers.CharField(max_length=255), required=False)

    class Meta:
        model = Group
        ignored_fields = ('packages',)

    def __init__(self, *args, **kwargs):
        super(GroupSerializer, self).__init__(*args, **kwargs)

        self._rop_id = None
        request = self.context.get('request')
        if request is not None:
            rop_id = request.QUERY_PARAMS.get('rop')
            if rop_id is not None:
                self._rop_id = str2int(rop_id)

        if self._rop_id is None:
            self.fields.pop('rop_deployment', None)
            self.fields.pop('rop_id_available', None)

    def get_server_num(self, obj):
        return obj.servers.values("hostname").distinct().count()

    def get_packages(self, obj):
        def dump_pkg(tpl=(None, 0)):
            pkg, count = tpl[0], tpl[1]
            pkg = PackageSerializer(pkg).data
            pkg.update(server_num=count)
            return pkg
        return map(dump_pkg, obj.summarize_packages())

    def get_health_check_url(self, obj):
        return obj.health_check_url()

    def is_braked(self, obj):
        current_deployment = obj.current_deployment
        if current_deployment is not None:
            return current_deployment.is_braked()
        else:
            return False

    def is_rollbackable(self, obj):
        try:
            obj.rollback_deployment
        except Exception:
            return False
        else:
            return True

    def get_current_deployment(self, obj):
        current_deployment = obj.current_deployment
        if current_deployment is not None:
            from .deployment import DeploymentSerializer
            serializer = DeploymentSerializer(current_deployment)
            return serializer.data
        else:
            return None

    def get_last_success_package(self, obj):
        deployment = obj.last_success_deployment
        return deployment.package_id if deployment else None

    def get_last_success_package_detail(self, obj):
        deployment = obj.last_success_deployment
        return PackageSerializer(deployment.package).data\
            if deployment else None


class JoinedGroupSerializer(GroupSerializer):

    check_identical_server = serializers.BooleanField(default=True, write_only=True)
    check_identical_version = serializers.BooleanField(default=True, write_only=True)

    class Meta:
        model = JoinedGroup
        extra_kwargs = {
            'application': {'required': True},
            'aggregation': {'required': True},
        }

    def to_representation(self, instance):
        """ repalce aggregation output of pk with GroupSerializer """

        resp = super(JoinedGroupSerializer, self).to_representation(instance)

        wanted_fields_name = [f.name for f in Group._meta.fields]

        resp_aggregation_replacement = [
            GroupSerializer(g, fields=wanted_fields_name).data
            for g in instance.aggregation.all()
        ]
        resp['aggregation'] = resp_aggregation_replacement

        return resp

    def to_internal_value(self, data):
        """ convert cms id to tars id, complete application if not given """
        python_data = super(JoinedGroupSerializer, self).to_internal_value(data)

        if 'application' not in python_data and 'aggregation' in python_data:
            python_data['application'] = python_data['aggregation'][0].application

        return python_data

    def validate(self, attr):
        # calculate switch bitmap
        validation_bitmap = int(
            "".join(
                reversed([
                    '1' if attr.pop(field_name) else '0'
                    for field_name in JoinedGroup._JOIN_CRITERIA_MASKS
                ])
            ),
            2
        )
        attr['validation_switches'] = validation_bitmap
        return attr

    def create(self, validated_data):
        sub_groups = validated_data.pop('aggregation')
        validation_switches = validated_data.pop('validation_switches')

        len_sub_groups = len(sub_groups)

        if len_sub_groups < 2:
            raise serializers.ValidationError("must have more than 1 aggregated group")

        if 'name' not in validated_data and len_sub_groups == 2:
            join_purpose = max([g.name for g in sub_groups], key=len).split("_")[-1]
            meaningful_name = "join_for_%s_%s" % (join_purpose, min([g.name for g in sub_groups], key=len))
            validated_data['name'] = meaningful_name

        try:
            with transaction.atomic():
                joined_group = super(JoinedGroupSerializer, self).create(validated_data)

                for sub_g in sub_groups:
                    joined_group.join(sub_g, validation_switches)
                return joined_group

        except Exception as e:
            raise serializers.ValidationError(e.message)

    def update(self, instance, validated_data):
        existsing_subs = set(instance.aggregation.values_list('id', flat=True))
        post_subs = set([g.pk for g in validated_data['aggregation']])
        validation_switches = validated_data.pop('validation_switches')


        if not existsing_subs.issubset(post_subs):
            raise serializers.ValidationError("forbid to drop groups in aggregation")

        try:
            with transaction.atomic():
                for g in validated_data['aggregation']:
                    instance.join(g, validation_switches)

                return instance
        except Exception as e:
            raise serializers.ValidationError(e.message)

