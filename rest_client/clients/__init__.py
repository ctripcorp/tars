from __future__ import absolute_import

from rest_client.utils import camel2underscore
from .es import get_es_client
from .salt import get_salt_client

__all__ = ('get_es_client', 'get_salt_client',)

_globals = globals()


# Add client to __all__ as get_xxx_client
def __factory(klass):
    def func():
        return klass
    func.__name__ = 'get_{}_client'.format(camel2underscore(klass.__name__))
    return func
