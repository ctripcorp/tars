import time
import requests
from roll_engine.utils.log import get_logger

es_logger = get_logger()


class HttpVerifyException(Exception):

    '''Raise when Verify install error'''
    pass

class BaseVerify(object):

    @classmethod
    def default_urls(cls, **kwargs):
        return {}

    @classmethod
    def bindings(cls, log_extra, **kwargs):
        raise NotImplementedError

    @classmethod
    def base_url(cls, **kwargs):
        raise NotImplementedError

    @classmethod
    def headers(cls, **kwargs):
        return {}

    @classmethod
    def auto_asserter(cls, response):
        return True

    @classmethod
    def http_retry(cls, url, headers, timeout, assert_func, log_extra, url_open_timeout=30.0, **kwargs):
        response = None
        # this is a magic number, change it if you find a better one
        sleep_time = min(30.0, timeout / 3.0)

        end_time = time.time() + timeout
        retry = 3

        while time.time() < end_time and retry > 0:
            try:
                response = requests.get(
                    url, timeout=url_open_timeout, headers=headers, verify=False)

                if not response.ok:
                    return response
                if assert_func(response):
                    return response
                else:
                    es_logger.warning(
                        u'Will retry verify because verify result not ok, code is {0}, data is: {1}'.format(response.status_code, response.text), extra=log_extra)
            except requests.Timeout as e:
                es_logger.error(
                    'Will retry verify because one request timeout', extra=log_extra)
            except requests.ConnectionError as e:
                es_logger.warning(
                    'Will retry verify because Connection Error', extra=log_extra)
                retry = retry - 1
                time.sleep(3)
                continue
            time.sleep(sleep_time)

        raise HttpVerifyException('retry verify timeout')

    @classmethod
    def verify(cls, timeout, log_extra, **kwargs):

        urls = cls.default_urls(**kwargs)
        urls.update(kwargs.get('extra_urls', {}))

        if not urls:
            es_logger.warning('No urls to verify', extra=log_extra)
            return True

        binding = cls.bindings(log_extra, **kwargs)
        if not binding:
            es_logger.error('No verify binding found!', extra=log_extra)
            return False

        base_url = cls.base_url(binding=binding, **kwargs)
        headers = cls.headers(binding=binding, **kwargs)

        for url, asserter in urls.items():
            full_url = '{0}{1}'.format(base_url, url)
            es_logger.info('Verifying {0}'.format(full_url), extra=log_extra)
            assert_func = getattr(cls, asserter, None)

            response = cls.http_retry(
                full_url, headers, timeout, assert_func, log_extra, **kwargs)

            if response.ok:
                es_logger.info(
                    u'Verify {0} result: Succeeded'.format(full_url), extra=log_extra)
            else:
                es_logger.error(
                    u'Verify result: Failed, code is {0}, data is: {1}'.format(response.status_code, response.text), extra=log_extra)
                return False

        return True


class Verify(BaseVerify):

    @classmethod
    def bindings(cls, log_extra, **kwargs):

        site_config = {'protocol': 'http', 'host': kwargs.get('ip_address'),
                       'port': kwargs.get('httpport')}

        return site_config

    @classmethod
    def base_url(cls, **kwargs):
        binding = kwargs.get('binding')
        url = '{0}://{1}:{2}'.format(binding['protocol'],
                                     binding['host'],
                                     binding['port'])
        return url

    @classmethod
    def headers(cls, **kwargs):
        return {}

    @classmethod
    def default_urls(cls, **kwargs):
        url = kwargs.get('health_check_url')

        return {url: 'auto_asserter'}

    @classmethod
    def auto_asserter(cls, response):
        return True