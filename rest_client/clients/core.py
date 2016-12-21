from __future__ import absolute_import

import json
import urlparse

import requests
from requests.exceptions import RequestException

from django.conf import settings

from rest_client.decorators import json_format
from rest_client.utils import ConfigDict, get_logger, Guardor
from rest_client.exceptions import (
    ServerResponseException, InvalidRestMethodException, ConfigMissing)


logger = get_logger()
ALLOWED_HTTP_METHODS = frozenset(('GET', 'POST', 'PUT', 'DELETE', 'PATCH'))


class Client(object):
    _timeout = 3
    _env = 'default'
    _default_env = 'default'
    _use_default = False

    _parser = staticmethod(json.loads)
    _error_parser = staticmethod(lambda x: x)

    def __new__(cls):
        raise AssertionError  # Client can't have instances

    @classmethod
    def config(cls, name=None, key=None):
        name = name or cls.__name__.upper()
        configs = settings.REST_CLIENT_SETTINGS.get(name, {})
        try:
            if cls._use_default and cls._env not in configs:
                profile = cls._default_env
            else:
                profile = cls._env
            config = configs[profile]
        except KeyError:
            raise ConfigMissing('Configuration for {} is not found'
                                .format(cls.__name__))
        config = ConfigDict(config)
        config.host = cls.__name__
        return config if key is None else config.get(key)

    @classmethod
    def build_url_base(cls):
        cfg = cls.config()
        url = urlparse.urlparse('http://' + cfg['HOSTNAME'])
        port = cfg.get('PORT') or '80'
        hostname = url.hostname
        url_str = url.geturl()
        cls._url_base = url_str.replace(
            hostname, '{}:{}'.format(hostname, port), 1)

    @classmethod
    def _get_sanitized_url(cls, url):
        if cls._url_base is None:
            cls.build_url_base()
        return urlparse.urljoin(cls._url_base, url)

    @classmethod
    def _rest_call(cls, url, method='GET', **kwargs):
        url = cls._get_sanitized_url(url)

        if method in ALLOWED_HTTP_METHODS:
            try:
                kwargs.setdefault('timeout', cls._timeout)
                response = requests.request(method.lower(), url, verify=True,
                                            **kwargs)
            except RequestException as e:
                raise ServerResponseException('Connection error {}'
                                              .format(e.message))
        else:
            raise InvalidRestMethodException(
                'Invalid method "{}" is used for the HTTP request. Can only'
                'use the following: {!s}'.format(method, ALLOWED_HTTP_METHODS)
            )

        if 200 <= response.status_code < 300:
            response_data = response.text

            data = cls._parser(response_data) if response_data else None
            return data
        else:
            cleansed_kwargs = Guardor.cleanse_content(kwargs)
            msg = '%s returned HTTP %d: %s\nResponse\nHeaders: %s\nBody: %s' % (
                url, response.status_code, cleansed_kwargs, response.headers,
                cls._error_parser(response.text))

            logger.error(msg)
            cls._error_handler(response)
            raise ServerResponseException(
                'Server response not OK. Verbose: {0}'.format(msg))

    @classmethod
    def _error_handler(cls, response):
        pass


class JsonClient(Client):
    @classmethod
    @json_format
    def _rest_call(cls, url, method, **kwargs):
        return super(JsonClient, cls)._rest_call(url, method, **kwargs)
