from __future__ import absolute_import

import inspect
from functools import wraps

from django_fsm import transition as fsm_transition

from roll_engine.models.base import FSMedModel


def transition(**kwds):
    def decorator(func):
        kwds['field'] = FSMedModel._meta.get_field('status')
        fsm_trans_func = fsm_transition(**kwds)(func)

        @wraps(func)
        def func_wrapper(*args, **kwargs):
            return fsm_trans_func(*args, **kwargs)
        return func_wrapper
    return decorator

from .deployment import *
from .batch import *
from .target import *

__all__ = [v for k, v in globals().items()
           if not k.startswith('_') and inspect.isclass(v)]
