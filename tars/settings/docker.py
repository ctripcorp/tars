from .local import *
# from .base import INSTALLED_APPS

# SECURITY WARNING: don't run with debug turned on in production!
# SECRET_KEY = '<CHANGEME>'
DEBUG = True
TEMPLATE_DEBUG = True

# Database
# https://docs.djangoproject.com/en/1.7/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'tars',
        'USER': 'tars',
        'PASSWORD': 'test1234',
        'HOST': 'db',
        'PORT': '3306',
        'OPTIONS': {
            'charset': 'utf8',
        },
        'TEST_CHARSET': 'utf8',
        'TEST_COLLATION': 'utf8_general_ci',
    }
}

REST_CLIENT_SETTINGS = dict(
    ES={
        'default': {
            'HOSTNAME': 'es',
            'PORT': '9200',
        }
    },
)

# Celery
BROKER_URL = 'redis://backend:6379/1'
CELERY_RESULT_BACKEND = 'redis://backend:6379/1'

CONSTANCE_REDIS_CONNECTION = 'redis://backend:6379/2'

# ENABLE/DISABLE CMS synchronize
CMS_SYNC = True

ENV = 'dev'
