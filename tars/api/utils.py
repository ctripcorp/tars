from datetime import timedelta
from collections import OrderedDict

from django.conf import settings

from constance import config
from djangorestframework_camel_case.render import CamelCaseJSONRenderer
from rest_framework import status

from tars.deployment import constants
from roll_engine import constants as _

mapping = {
    'running': constants.RUNNINGS + [_.SMOKE_SUCCESS,
                                     _.BAKE_SUCCESS,
                                     _.ROLLOUT_SUCCESS],
    'braked': constants.BRAKED,
    'failure': constants.FAILURES,
    'idle': constants.HALTED,
}


class TarsJSONRenderer(CamelCaseJSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        renderer_context = renderer_context or {}
        response = renderer_context['response']
        view = renderer_context['view']

        data = self._wrap(data, response)

        return super(TarsJSONRenderer, self).render(data,
                                                    accepted_media_type,
                                                    renderer_context)

    def _wrap(self, data, response):
        new_dict = OrderedDict()
        new_dict[u'status'] = response.status_code

        if status.is_success(response.status_code):
            new_dict[u'data'] = data
            new_dict[u'errors'] = []
        else:
            new_dict[u'data'] = {}
            new_dict[u'errors'] = data if isinstance(data, list) else [data]
        return new_dict


def get_paginate_params(request):
    paginate_by_param = settings.REST_FRAMEWORK.get('PAGINATE_BY_PARAM',
                                                    'page_size')
    default_page_size = settings.REST_FRAMEWORK.get('PAGINATE_BY')
    page_size = request.QUERY_PARAMS.get(paginate_by_param) or default_page_size
    page = request.QUERY_PARAMS.get('page', 1)
    return [int(page), int(page_size)]


def cmp_attrs(src_attrs, dst_attrs):
    if src_attrs.keys() != dst_attrs.keys():
        return False
    for key in src_attrs.keys():
        if key == 'config':
            pass
        else:
            if src_attrs[key] != dst_attrs[key]:
                return False
    return True


def str2bool(value):
    if isinstance(value, bool):
        return value
    else:
        if isinstance(value, basestring):
            value = value.lower()
        return {'true': True, 'false': False}.get(value, None)


def str2int(value):
    try:
        return int(value)
    except (ValueError, TypeError):
        return None


def convert_status(statuses):
    # TODO double confirm deployment status in mapping
    import operator
    modified_status = [mapping[status] for status in statuses
                       if status in mapping]
    return set(reduce(operator.add, modified_status, []))


def parse_status(statuses):
    parsed_status = set()
    for s in statuses:
        parsed_status.update([k for k, v in mapping.items() if s in v])
    return parsed_status


def fade_back_date(dt, month=1):
    day = dt.day

    for i in range(month):
        first = dt.replace(day=1)
        dt = first - timedelta(days=1)
    return dt.replace(day=day)


def summarize_apps(raw_data):
    summarized_data = {}
    for app_data in raw_data:
        app_id, category = app_data
        category = u'{}'.format(category)
        summarized_data.setdefault(category, {'count': 0, 'applications': []})
        summarized_data[category]['count'] += 1
        summarized_data[category]['applications'].append(app_id)
    return summarized_data

def replace_hermes_header(request):
    if request.content_type == 'application/octet-stream':
        request._content_type = 'application/json'
