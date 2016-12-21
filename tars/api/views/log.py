from datetime import datetime

from django.core.exceptions import ObjectDoesNotExist

from constance import config
from elasticsearch import exceptions
from rest_framework import viewsets
from rest_framework.response import Response

from rest_client import get_es_client

from tars.api.utils import get_paginate_params
from tars.deployment.models import TarsDeployment
from tars.api.serializers import LogSerializer


class LogQuerySet(list):

    """ A Faked QuerySet used for LogViewSet Pagination"""

    def __init__(self, request):
        # sort_by is not used for now, but we reserve it for future use
        self.sort_by = None
        self.sort_order = None
        self._build_query(request)
        self.count = None
        self.logs = None

    def _build_query(self, request):
        params = ['deploy_id', 'deploy_target', 'deploy_target_status',
                  'search', 'log_module', 'log_level']

        page, page_size = get_paginate_params(request)
        raw_dict = {param: request.QUERY_PARAMS.get(param)
                    for param in params if request.QUERY_PARAMS.get(param)}

        self.sort_by = request.QUERY_PARAMS.get('sort', 'log_timestamp')
        self.sort_order = request.QUERY_PARAMS.get('sort_order', 'desc')

        timestamp = request.QUERY_PARAMS.get(
            'timestamp', datetime.now().isoformat()[:-3] + 'Z')
        direction = request.QUERY_PARAMS.get('direction', 'backward')

        query_dict = {}
        try:
            deploy = TarsDeployment.objects.get(pk=raw_dict['deploy_id'])
        except (KeyError, ObjectDoesNotExist):
            raise exceptions.TransportError(400, 'deploy id error')

        must = []
        should = None
        for k, v in raw_dict.iteritems():
            if k == 'search':
                v = v.replace('-', ' ')
                must.append({
                    'multi_match': {
                        'fields': ['deploy_target_ip', 'deploy_target_name'],
                        'query': v,
                        "operator": "and"}
                })
            elif k == 'deploy_target_status':
                should = [{'match': {k: i}} for i in v.split(',')]
            elif k == 'deploy_target':
                must.append({'terms': {k: v.split(',')}})
            elif k == 'log_level':
                must.append({'terms': {k: [l.upper() for l in v.split(',')]}})
            elif k == 'log_module':
                must.append({'match': {'_type': v}})
            else:
                must.append({'match': {k: v}})

        # Careful here, the pattern is (start_time, end_time)
        range_dict = {}
        if direction == 'backward':
            range_dict['lt'] = timestamp
            query_dict['size'] = page_size
            if page > 1:
                query_dict['from_'] = (page - 1) * page_size
        else:
            range_dict['gt'] = timestamp
            query_dict['size'] = 300
            # query_dict['search_type'] = 'scan'
            # query_dict['scroll'] = '30s'

        must.append({'range': {'log_timestamp': range_dict}})

        query_bool_dict = {'must': must}
        if should is not None:
            query_bool_dict['should'] = should
            query_bool_dict['minimum_should_match'] = 1

        query_dict['index'] = deploy.log_index()
        query_dict['sort'] = "log_timestamp:desc"
        query_dict['body'] = {"query": {"bool": query_bool_dict}}

        self.query = query_dict

    def _fetch_data(self):
        def format_log(data):
            log = data.get('_source', {})
            log.update({
                "log_module": log.get('log_type') or data["_type"],
                "log_id": data["_id"]
            })
            return log

        try:
            hit_items = []
            es = get_es_client()

            if self.query.get('search_type', 'query') == 'scan':
                raw_data = es.search(**self.query)
                hit_items = raw_data.get('hits', {}).get('hits', [])
                self.count = raw_data.get('hits', {}).get('total')
            else:
                raw_data = es.search(**self.query)
                hit_items = raw_data.get('hits', {}).get('hits', [])
                self.count = raw_data.get('hits', {}).get('total')

            hit_items = sorted(
                hit_items,
                key=lambda t: t.get('_source', {}).get('log_timestamp'),
                reverse=(self.sort_order == 'desc')
            )
            self.logs = [format_log(hit) for hit in hit_items]
        except exceptions.NotFoundError:
            self.count = 0
            self.logs = []

    def __getslice__(self, i, j):
        return self.__getitem__(slice(i, j))

    def __getitem__(self, item):
        if self.logs is None:
            self._fetch_data()

        if isinstance(item, int):
            try:
                return self.logs[item]
            except IndexError:
                return None
        if isinstance(item, slice):
            return self.logs

    def __len__(self):
        if self.count is None:
            self._fetch_data()
        return self.count


class LogViewSet(viewsets.ViewSet):
    """ Log resource. """

    def list(self, request, format=None):
        """
        Return a list of logs on elasticsearch
        ---
        response_serializer: LogSerializer
        """
        try:
            queryset = LogQuerySet(request)

            serializer = LogSerializer(
                queryset, context={'request': request}, many=True)
            return Response(serializer.get_paginated_data())
        except (exceptions.ConnectionError, exceptions.TransportError) as e:
            return Response(e.error, status=e.status_code)
