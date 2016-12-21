from django.core.paginator import EmptyPage, PageNotAnInteger, Paginator
from django.core.validators import ip_address_validators
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone

from rest_framework import serializers
from rest_framework.pagination import PaginationSerializer
from rest_framework.serializers import ValidationError

from tars.api.utils import get_paginate_params


class DatetimeTzAwareField(serializers.DateTimeField):
    def to_representation(self, value):
        value = timezone.localtime(value)
        return super(DatetimeTzAwareField, self).to_representation(value)


class PkModelField(serializers.IntegerField):
    """ simple field do convertion between a pk and model obj """

    def __init__(self, model, **kwargs):
        super(PkModelField, self).__init__(**kwargs)
        self.model = model

    def to_internal_value(self, data):
        pk = super(PkModelField, self).to_internal_value(data)
        try:
            return self.model.objects.get(pk=pk)
        except ObjectDoesNotExist as e:
            raise serializers.ValidationError(e.message)

    def to_representation(self, obj):
        return obj.pk


class IPv4AddressField(serializers.CharField):

    default_error_messages = {
        'invalid': 'Enter a valid IPv4 address.',
    }

    def __init__(self, **kwargs):
        super(IPv4AddressField, self).__init__(**kwargs)
        validators, _ = ip_address_validators("ipv4", False)
        self.validators.extend(validators)


class DynamicFieldsModelSerializer(serializers.ModelSerializer):
    created_at = DatetimeTzAwareField(read_only=True)
    updated_at = DatetimeTzAwareField(read_only=True)

    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)
        ignored_fields = kwargs.pop('ignored_fields',
                                    getattr(self.Meta, 'ignored_fields', []))
        self.fields.pop('DataChange_LastTime', None)
        self.fields.pop('is_deleted', None)
        super(DynamicFieldsModelSerializer, self).__init__(*args, **kwargs)

        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields.keys())
            for field_name in existing - allowed:
                self.fields.pop(field_name)
        if ignored_fields is not None:
            for field in ignored_fields:
                self.fields.pop(field, None)


class PaginatedListSerializer(serializers.ListSerializer):

    def get_page(self):
        request = self.context.get('request')
        page, page_size = get_paginate_params(request)
        paginator = Paginator(self.instance, page_size)
        return paginator.page(page)

    def get_paginated_data(self, **kwargs):
        try:
            page = self.get_page()
        except (EmptyPage, PageNotAnInteger) as e:
            raise ValidationError(e)
        else:
            try:
                pagination_serializer_class = self.child.__class__.\
                    get_pagination_serializer_class(**kwargs)
            except:
                pagination_serializer_class = PaginationSerializer

            serializer = pagination_serializer_class(page, context=self.context)
            return serializer.data


class PaginatedSerializerMixin(object):
    _serializer_cache = {}

    @classmethod
    def get_pagination_serializer_class(cls, fields=None, ignored_fields=None):
        class CustomSerializer(cls):
            class Meta:
                model = getattr(cls.Meta, 'model')
                ignored_fields = getattr(cls.Meta, 'ignored_fields', tuple())

        klass = cls
        if fields is not None:
            setattr(CustomSerializer.Meta, 'fields', fields)
            klass = CustomSerializer
        if ignored_fields is not None:
            setattr(CustomSerializer.Meta, 'ignored_fields', ignored_fields)
            klass = CustomSerializer

        if klass.__name__ in klass._serializer_cache:
            return klass._serializer_cache[klass.__name__]
        else:
            class SerializerClass(PaginationSerializer):
                class Meta:
                    object_serializer_class = klass
            if ignored_fields is None:
                klass._serializer_cache[klass.__name__] = SerializerClass
            return SerializerClass

    @classmethod
    def many_init(cls, *args, **kwargs):
        if issubclass(cls, DynamicFieldsModelSerializer):
            fields = kwargs.pop('fields', None)
            ignored_fields = kwargs.pop('ignored_fields', None)
            kwargs['child'] = cls(fields=fields, ignored_fields=ignored_fields)
        else:
            kwargs['child'] = cls()

        meta = getattr(cls, 'Meta', None)
        list_serializer_class = getattr(meta,
                                        'list_serializer_class',
                                        PaginatedListSerializer)
        return list_serializer_class(*args, **kwargs)


class LogSerializer(PaginatedSerializerMixin, serializers.Serializer):

    @classmethod
    def get_pagination_serializer_class(cls):
        return PaginationSerializer
