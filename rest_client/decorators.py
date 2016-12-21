import json
from functools import wraps

from djangorestframework_camel_case.util import underscoreize, camelize

try:
    import vcr
    from constance import config
except ImportError:
    config = None


def camelize_request_data(func):
    @wraps(func)
    def func_wrapper(*args, **kwargs):
        raw_data = kwargs.get('data')
        if raw_data is not None:
            kwargs['data'] = camelize(raw_data)
        return func(*args, **kwargs)
    return func_wrapper


def under_scorized_response_data(func):
    @wraps(func)
    def func_wrapper(*args, **kwargs):
        rsp = func(*args, **kwargs)
        if hasattr(rsp, '__iter__'):
            rsp = underscoreize(rsp)
        return rsp
    return func_wrapper


def json_format(func):
    @wraps(func)
    def func_wrapper(*args, **kwargs):
        kwargs.setdefault('headers', {})
        kwargs['headers']['Content-Type'] = 'application/json'
        kwargs['headers']['Accept'] = 'application/json'

        if 'data' in kwargs:
            kwargs['data'] = json.dumps(kwargs['data'])

        return func(*args, **kwargs)
    return func_wrapper


def octet_stream_format(func):
    @wraps(func)
    def func_wrapper(*args, **kwargs):
        kwargs.setdefault('headers', {})
        kwargs['headers']['Content-Type'] = 'application/octet-stream'

        if 'data' in kwargs:
            kwargs['data'] = json.dumps(kwargs['data'])

        return func(*args, **kwargs)
    return func_wrapper


def osg(func):
    @wraps(func)
    def func_wrapper(*args, **kwargs):
        client = args[0]
        if client._osg_token is None:
            client._osg_token = client.config('OSGTOKEN')

        body = kwargs.get('data')
        kwargs['data'] = {
            'request_body': body,
            'access_token': client._osg_token
        }

        return func(*args, **kwargs)
    return func_wrapper


def mock(client, match_on=['uri', 'method', 'query', 'body']):
    def decorator(func):
        @wraps(func)
        def func_wrapper(*args, **kwargs):
            if getattr(config, 'MOCK_{}'.format(client.upper()), False):
                file_name = 'mock_{}_data.yaml'.format(client.lower())
                kws = dict(record_mode='new_episodes', match_on=match_on)
                with vcr.use_cassette(file_name, **kws):
                    return func(*args, **kwargs)
            else:
                return func(*args, **kwargs)
        return func_wrapper
    return decorator
