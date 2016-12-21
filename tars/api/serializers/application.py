from django.db import IntegrityError, transaction

from rest_framework import serializers
from rest_framework.serializers import ValidationError

from tars.api.utils import str2bool
from tars.application.models import Application
from tars.server.models import JoinedGroup
from tars.exceptions import SyncError
from .base import (PaginatedSerializerMixin, DynamicFieldsModelSerializer,
                   PaginatedListSerializer)
from .server import GroupSerializer


class ApplicationListSerializer(PaginatedListSerializer):

    def __init__(self, *args, **kwargs):
        self._is_preview = False
        return super(ApplicationListSerializer, self).__init__(*args, **kwargs)

    def to_internal_value(self, data):
        if not isinstance(data, list):
            try:
                self._need_sync = str2bool(data['sync'])
                self._is_preview = str2bool(data.get('preview', False))
                data = data['data']
                if not isinstance(self._need_sync, bool):
                    raise Exception('sync value should be boolean')
                if not isinstance(data, list):
                    raise Exception('data value error')
            except Exception as e:
                raise ValidationError('Format Error {0}'.format(e))

        return super(ApplicationListSerializer, self).to_internal_value(data)

    def to_representation(self, data):
        if self._is_preview:
            return data
        else:
            return super(ApplicationListSerializer, self)\
                .to_representation(data)

    def create(self, validated_data):
        preview_hint = 'Raise exception for preview'
        preview_result = []

        try:
            apps = [Application(**item) for item in validated_data]
            with transaction.atomic():
                apps = Application.objects.bulk_create(apps)
                if self._need_sync:
                    app_group_map = {str(i['app_id']): i.get('group_ids', [])
                                     for i in self.initial_data['data']}
                    for app in apps:
                        group_ids = app_group_map[str(app.id)]
                        app.sync_cms(ignore_setting=True, group_ids=group_ids)

                if self._is_preview:
                    serializer = ApplicationPreviewSerializer(apps, many=True)
                    preview_result = serializer.data
                    raise IntegrityError(preview_hint)
        except IntegrityError as e:
            if e.message == preview_hint:
                return preview_result
            else:
                raise ValidationError('Bulk creating applications error {0}'
                                      .format(e))
        except (SyncError, KeyError) as e:
            raise ValidationError('Sync error {0}'.format(e))
        else:
            return apps


class ApplicationSerializer(PaginatedSerializerMixin,
                            DynamicFieldsModelSerializer):
    groups = GroupSerializer(read_only=True, many=True,
                             fields=('id', 'name', 'forts', 'group_id',
                                     'health_check_url', 'last_success_package',
                                     'site_name', 'current_deployment'))
    statuses = serializers.SerializerMethodField('status')
    app_id = serializers.IntegerField(required=False)

    class Meta:
        model = Application
        ignored_fields = ('statuses', 'environment')
        list_serializer_class = ApplicationListSerializer

    def to_representation(self, obj):
        ret = super(ApplicationSerializer, self).to_representation(obj)
        # parse app_env_tags from yaml is a high overhead operation, to prevent
        # from redundant performance cost we reuse app_env_tags to generate obj
        # tags, language and etc.
        app_env_tags = obj._app_env_tags()
        tags = obj._tags(app_env_tags)
        language = obj._language(app_env_tags)
        container = obj._container(app_env_tags)
        ret.update(language=language, tags=tags, container=container)

        # exclude concrete groups who are JOINed into JoinedGroup
        g_ids_in_joins = JoinedGroup.objects.filter(application_id=obj.pk)\
                                            .values_list("aggregation", flat=True)
        g_should_be_hide = set(g_ids_in_joins)

        ret['groups'] = \
            [order_dict for order_dict in ret['groups'] if order_dict.get('id') not in g_should_be_hide]

        # add field to indicate whether package consistence is ok in diff groups
        if 'last_success_package' in self.fields['groups'].child.fields:
            current_in_service_packages = set([
                g['last_success_package'] for g in ret['groups']
                if g['current_deployment'] is None and
                g['last_success_package'] is not None
            ])
            consistence = len(current_in_service_packages) <= 1
            ret.update(consistence=consistence)
        return ret

    def status(self, obj):
        return obj.summarize_status()

    def validate(self, attrs):
        app_id = attrs.pop('app_id', None)
        if app_id is not None:
            attrs['id'] = app_id
        return super(ApplicationSerializer, self).validate(attrs)


class ApplicationSimpleSerializer(ApplicationSerializer):
    groups = GroupSerializer(read_only=True, many=True,
                             fields=('id', 'name', 'forts', 'group_id',
                                     'site_name', 'health_check_url'),
                             ignored_fields=tuple())


class ApplicationSummarySerializer(ApplicationSerializer):
    groups = GroupSerializer(many=True,
                             fields=('id', 'forts', 'server_num', 'packages',
                                     'site_name', 'health_check_url'),
                             ignored_fields=tuple())

    class Meta:
        model = Application


class ApplicationPreviewSerializer(ApplicationSummarySerializer):
    groups = GroupSerializer(many=True,
                             fields=('id', 'forts', 'server_num', 'site_name',
                                     'servers', 'group_id'),
                             ignored_fields=tuple())
