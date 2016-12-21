from __future__ import absolute_import

import urlparse
from elasticsearch import Elasticsearch

from rest_client.decorators import osg
from rest_client.exceptions import ESClientError, ServerResponseException
from .core import JsonClient


class ES(JsonClient):
    _es = None
    _url_base = None
    _env = 'default'

    @classmethod
    def config(cls, key=None):
        return super(ES, cls).config('ES', key)


def get_es_client(env='default'):
    es_kls = ES

    if es_kls._es is None:
        es_kls._env = 'default'
        es_kls.build_url_base()
        es_kls._es = Elasticsearch(es_kls._url_base)

    return es_kls._es
