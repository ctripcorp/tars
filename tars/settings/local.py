from .base import *
from .environments import *

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '<CHANGEME>'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True
TEMPLATE_DEBUG = True

# debugging utilities
# INSTALLED_APPS += ('rest_framework_swagger', "django_extensions",)
# SWAGGER_SETTINGS = {
#     'exclude_namespaces': [],
#     'api_version': '1',
#     'api_path': '/',
#     'enabled_methods': [
#         'get',
#         'post'
#     ],
#     'api_key': '',
#     'is_authenticated': False,
#     'is_superuser': False,
#     'permission_denied_handler': None,
#     'info': {
#         'contact': 'gxdong@ctrip.com',
#         'description': 'This is online api-docs of TARS built by swagger',
#         'title': 'TARS App',
#     },
#     'doc_expansion': 'none',
# }

# Database
# https://docs.djangoproject.com/en/1.7/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': '<CHANGEME>',
        'USER': '<CHANGEME>',
        'PASSWORD': '<CHANGEME>',
        'HOST': '<CHANGEME>',
        'TEST_CHARSET': 'utf8',
        'TEST_COLLATION': 'utf8_general_ci',
    }
}

# Celery
BROKER_URL = 'redis://:password@hostname:port/db_number'
CELERY_RESULT_BACKEND = 'redis://:password@hostname:port/db_number'

# 3rd service dependencies
REST_CLIENT_SETTINGS = dict(
    SALT={
        'default': {
            'HOSTNAME': '<CHANGEME>',
            'USERNAME': '<CHANGEME>',
            'PASSWORD': '<CHANGEME>',
            'PORT': '<CHANGEME>',
        },
        'osg_default': {
            'HOSTNAME': '<CHANGEME>',
            'USERNAME': '<CHANGEME>',
            'PASSWORD': '<CHANGEME>',
            'PORT': '<CHANGEME>',
            'OSGTOKEN': '<CHANGEME>',
            'API': '<CHANGEME>',
        },
    },
    ES={
        'default': {
            'HOSTNAME': '<CHANGEME>',
            'PORT': '<CHANGEME>',
        }
    },
)

# constance
CONSTANCE_BACKEND = 'constance.backends.redisd.RedisBackend'

CONSTANCE_REDIS_CONNECTION = {
    'host': "<hostname>",
    'port': "<port>",
    'db': "<db_num>",
}

# Polymorph rule engine defaults
DEPLOY_DECISION_TABLE = '''
    env  category            deployment
    ========================================================
    *    simply_roll        TarsDeployment4UAT
    *    *                  TarsFortDeployment
'''

SLB_DECISION_TABLE = '''
    g_type          slb
    ========================================================================
    join       JoinedGroupSlbFacade
    *          FakedSlbFacade
'''

CONSTANCE_CONFIG = {
    'ENV': ('dev', 'specify the environment where TARS is running'),
    'ENABLE_PERMISSION': (True, 'whether only registered user can use tars to deploy'),
    'EXTERNAL_SLB': (True, 'ENABLE/DISABLE load balance operation during deployment'),
    'DECISION_TABLE_DEPLOY': (
        DEPLOY_DECISION_TABLE, 'rules for routing deployment class'),
    'DECISION_TABLE_SLB': (
        SLB_DECISION_TABLE, 'rules for routing slb client'),
    'MOCK_CMS': (False, 'mock CMS data from "mock_cms_data.yaml"'),
    'MOCK_SLB': (False, 'mock SLB response from "mock_slb_data.yaml"'),
    'SEND_TRACKER': (False, 'ENABLE/DISABLE tracker support switch'),
}
