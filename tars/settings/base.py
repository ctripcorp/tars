# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# Application definition
INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # third party apps
    'constance',
    'django_fsm',
    'rest_framework',
    'roll_engine',

    # tars apps
    'tars.api',
    'tars.application',
    'tars.deployment',
    'tars.engine',
    'tars.server',
    'tars.surface',
    'tars.middleware'
)

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.gzip.GZipMiddleware',
)

ROOT_URLCONF = 'tars.urls'

WSGI_APPLICATION = 'tars.wsgi.application'

MIGRATION_MODULES = {
    'tars.deployment': 'tars.deployment.migrations'
}

# Internationalization
# https://docs.djangoproject.com/en/1.7/topics/i18n/
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Shanghai'

USE_I18N = True
USE_L10N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.7/howto/static-files/
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(os.path.dirname(BASE_DIR), 'tars/surface/static')
LOGIN_URL = '/login/'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_PARSER_CLASSES': (
        'djangorestframework_camel_case.parser.CamelCaseJSONParser',
        'rest_framework.parsers.FormParser',
    ),
    'DEFAULT_RENDERER_CLASSES': (
        'tars.api.utils.TarsJSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
        'rest_framework_jsonp.renderers.JSONPRenderer',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'rest_framework.filters.DjangoFilterBackend',
    ),
    'PAGINATE_BY': 20,
    'PAGINATE_BY_PARAM': 'page_size',
    'MAX_PAGINATE_BY': 100,
}

# Celery
CELERY_TIMEZONE = 'Asia/Shanghai'
CELERY_ENABLE_UTC = True

# constance
CONSTANCE_BACKEND = 'constance.backends.redisd.RedisBackend'
CONSTANCE_SUPERUSER_ONLY = False


