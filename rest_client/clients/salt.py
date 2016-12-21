import json
import time
from contextlib import closing

from rest_client.exceptions import (
    ServerResponseException, SaltAuthenticationError,
    SaltModuleUnavailableException, SaltClientError)
from .core import Client

MAGIC_SLEEP_INTERVAL = [2, 4, 8, 16]


class Salt(Client):
    _url_base = None
    _timeout = 15
    _token = None
    _expire = None
    stream = None
    _lookup = None
    _auth_type = None
    _sync_method = None
    _async_method = None

    @classmethod
    def config(cls, key=None):
        return super(Salt, cls).config('SALT', key)

    @classmethod
    def build_url_base(cls):
        cfg = cls.config()
        hostname = cfg['HOSTNAME']
        port = cfg.get('PORT')
        cls._url_base = "http://{}".format(hostname)

        if port is not None:
            cls._url_base = '{}:{}'.format(cls._url_base, port)

    @classmethod
    def lookup(cls):
        if cls._lookup is None:
            cls._lookup = cls.config().get('LOOKUP') or cls.sync_method()
        return cls._lookup

    @classmethod
    def auth_type(cls):
        if cls._auth_type is None:
            cls._auth_type = cls.config().get('AUTH_TYPE') or 'passwd'
        return cls._auth_type

    @classmethod
    def sync_method(cls):
        if cls._sync_method is None:
            if cls.auth_type() == 'token':
                cls._sync_method = ''
            else:
                cls._sync_method = 'run'
        return cls._sync_method

    @classmethod
    def async_method(cls):
        if cls._async_method is None:
            if cls.auth_type() == 'token':
                cls._async_method = 'minions'
            else:
                cls._async_method = 'run'
        return cls._async_method

    @classmethod
    def authenticate(cls):
        if cls._token is None or (time.time() > cls._expire):
            cfg = cls.config()
            data = json.dumps({
                'username': cfg['USERNAME'],
                'password': cfg['PASSWORD'],
                'eauth': 'pam',
            })
            url = cls._get_sanitized_url('login')

            headers = {'Content-Type': 'application/json',
                       'Accept': 'application/json'}

            try:
                rsp = super(Salt, cls)._rest_call(url, 'POST',
                                                  data=data, headers=headers,
                                                  timeout=cls._timeout)
            except ServerResponseException as e:
                raise SaltAuthenticationError(e)
            else:
                cls._handle_token(rsp.get('return', [None])[0])

    @classmethod
    def _handle_token(cls, credential):
        if credential is not None:
            cls._token = credential.get('token')
            cls._expire = credential.get('expire')
        else:
            raise SaltAuthenticationError('Token is missing')

    @classmethod
    def _token_expired(cls, rsp_message):
        if (isinstance(rsp_message, basestring) and
                "Please log in" in rsp_message):
            return True

        return False

    @classmethod
    def _module_available(cls, rsp_message):
        if isinstance(rsp_message[0], dict):
            for s in rsp_message[0].values():
                if isinstance(s, basestring):
                    if "is not available" in s:
                        raise SaltModuleUnavailableException(s)
                    if "arguments are not valid" in s:
                        raise SaltModuleUnavailableException(s)
        return True

    @classmethod
    def _rest_call_with_token(cls, url, method, **kwargs):
        if 'headers' not in kwargs:
            kwargs['headers'] = dict()

        kwargs['headers']['Content-Type'] = 'application/json'
        kwargs['headers']['Accept'] = 'application/json'
        kwargs = cls._get_sanitized_kwargs(url, **kwargs)

        for x in range(4):
            cls.authenticate()

            kwargs['headers']['X-Auth-Token'] = cls._token

            try:
                rsp = super(Salt, cls)._rest_call(url, method, **kwargs)
                rsp_message = rsp.get('return', [None])
            except ServerResponseException as e:
                if x > 2:
                    raise SaltClientError(e)
                cls._token = None
                continue

            if cls._token_expired(rsp_message):
                cls._token = None
                continue

            cls._module_available(rsp_message)

            return rsp_message[0]

    @classmethod
    def _rest_call_with_passwd(cls, url, method, **kwargs):
        if 'headers' not in kwargs:
            kwargs['headers'] = dict()

        kwargs['headers']['Content-Type'] = 'application/json'
        kwargs['headers']['Accept'] = 'application/json'
        kwargs['data']['username'] = cls.config()['USERNAME']
        kwargs['data']['password'] = cls.config()['PASSWORD']
        kwargs['data']['eauth'] = 'pam'

        kwargs = cls._get_sanitized_kwargs(url, **kwargs)

        for x in range(4):
            try:
                rsp = super(Salt, cls)._rest_call(url, method, **kwargs)
                rsp_message = rsp.get('return', [None])
            except ServerResponseException as e:
                if x > 2:
                    raise SaltClientError(e)
                continue

            if cls._token_expired(rsp_message):
                raise SaltAuthenticationError('salt auth error')

            cls._module_available(rsp_message)

            return rsp_message[0]

    @classmethod
    def _rest_call(cls, url, method, **kwargs):
        if cls.auth_type() == 'token':
            return cls._rest_call_with_token(url, method, **kwargs)
        return cls._rest_call_with_passwd(url, method, **kwargs)

    @classmethod
    def _get_sanitized_kwargs(cls, url, **kwargs):
        kwargs['data'] = json.dumps([kwargs.get('data')])
        return kwargs

    @classmethod
    def _build_data(cls, *args, **kwargs):
        tgt = kwargs.get('tgt')
        if (isinstance(tgt, list) or
                (isinstance(tgt, basestring) and ',' in tgt)):
            kwargs['expr_form'] = 'list'
        if args:
            kwargs['arg'] = args
        return kwargs

    @classmethod
    def run(cls, target, command, *args):
        ''' send one or more Salt commands '''
        data = cls._build_data(*args, client='local', tgt=target, fun=command)
        return cls._rest_call(cls.sync_method(), 'POST', data=data)

    @classmethod
    def run_async(cls, target, command, *args):
        data = cls._build_data(
            *args, client='local_async', tgt=target, fun=command)
        rsp = cls._rest_call(cls.async_method(), 'POST', data=data)
        return rsp.get('jid')

    @classmethod
    def run_module(cls, target, module_func, *args, **kwargs):
        data = cls._build_data(*args, client='local', tgt=target,
                               fun=module_func, kwarg=kwargs)
        return cls._rest_call(cls.sync_method(), 'POST', data=data)

    @classmethod
    def run_module_async(cls, target, module_func, *args, **kwargs):
        data = cls._build_data(*args, client='local_async', tgt=target,
                               fun=module_func, kwarg=kwargs)
        rsp = cls._rest_call(cls.async_method(), 'POST', data=data)
        return rsp.get('jid')

    @classmethod
    def run_module_await(cls, target, module_func, *args, **kwargs):
        def need_break(result):
            tgt_list = target if isinstance(target, (list, tuple)) else [target]
            return all([(tgt in result) for tgt in tgt_list])

        data = cls._build_data(*args, client='local_async', tgt=target,
                               fun=module_func, kwarg=kwargs)
        wait_timeout = kwargs.pop('wait_timeout')
        rsp = cls._rest_call(cls.sync_method(), 'POST', data=data)

        jid = rsp.get('jid')
        index = slept = 0
        intervals = MAGIC_SLEEP_INTERVAL

        while True:
            to_sleep = intervals[index]
            time.sleep(to_sleep)

            result = cls.job_result(jid)
            if need_break(result):
                return (result, None)

            if slept >= wait_timeout:
                return (result, 'Timeout on jid: {}'.format(jid))

            slept += to_sleep
            index = (index + 1) % len(intervals)

    @classmethod
    def job_result(cls, jid):
        data = cls._build_data(client='runner', fun='jobs.lookup_jid', jid=jid)
        return cls._rest_call(cls.lookup(), 'POST', data=data)

    @classmethod
    def jobs(cls, jid):
        """ get the result from a single job """
        url = 'jobs/{}'.format(jid)
        return cls._rest_call(url, 'GET')

    @classmethod
    def run_state(cls, target, state, **kwargs):
        data = cls._build_data(client='local', tgt=target, fun='state.sls',
                               arg=state, kwarg={'pillar': kwargs})
        return cls._rest_call(cls.sync_method(), 'POST', data=data)

    @classmethod
    def run_orchestration(cls, mods, *args, **kwargs):
        data = cls._build_data(client='runner', fun='state.orchestrate',
                               mods='orchestration.' + mods, pillar=kwargs)
        return cls._rest_call(cls.sync_method(), 'POST', data=data)

    @classmethod
    def __events_on(cls):
        """ listen events on an HTTP stream """
        url = 'events/{}'.format(cls._token)
        return cls._rest_call(url, 'GET', stream=True)

    @classmethod
    def __events_off(cls):
        if cls.stream:
            with closing(cls.stream) as r:
                r.connection.close()
                cls.stream = None


class OsgSalt(Salt):
    _url_base = None
    _osg_token = None
    _token = None
    _expire = None
    _env = 'osg_default'

    @classmethod
    def build_url_base(cls):
        cfg = cls.config()
        hostname = cfg['HOSTNAME']
        port = cfg['PORT']
        api = cfg['API']
        cls._url_base = "http://{}:{}/{}/".format(hostname, port, api)

    @classmethod
    def _get_sanitized_kwargs(cls, url, **kwargs):
        if cls._osg_token is None:
            cfg = cls.config()
            cls._osg_token = cfg['OSGTOKEN']

        if url.endswith('login'):
            body = kwargs.get('data')
        else:
            body = [kwargs.get('data')]

        kwargs['data'] = json.dumps({
            'request_body': body,
            'access_token': cls._osg_token
        })
        return kwargs


_client_cache = {'salt': Salt, 'osgsalt': OsgSalt}


def get_salt_client(salt='salt'):
    salt = salt.lower()
    try:
        return _client_cache[salt]
    except KeyError:
        if salt.endswith('osgsalt'):
            base_salt = OsgSalt
        elif salt.endswith('salt'):
            base_salt = Salt
        else:
            return
        base_salt_name = base_salt.__name__
        class_name = "{}{}".format(salt[:-len(base_salt_name)].title(),
                                   base_salt_name)
        data = dict(
            _url_base=None,
            _timeout=15,
            _token=None,
            _expire=None,
            stream=None,
            _lookup=None,
            _auth_type=None,
            _sync_method=None,
            _async_method=None
        )
        data.update(_env=salt[:-len(base_salt_name)])
        _client_cache[salt] = type(class_name, (base_salt,), data)
        return _client_cache[salt]
