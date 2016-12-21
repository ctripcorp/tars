from functools import wraps

from django.contrib.auth.decorators import login_required as dj_login_required
from constance import config


def login_required(func):
    @wraps(func)
    def func_wrapper(*args, **kwargs):
        if config.ENABLE_PERMISSION:
            return dj_login_required(func)(*args, **kwargs)
        else:
            return func(*args, **kwargs)
    return func_wrapper
