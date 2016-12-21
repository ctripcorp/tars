import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "tars.settings")

from django.conf import settings
from django.core.wsgi import get_wsgi_application

if "raven.contrib.django.raven_compat" in settings.INSTALLED_APPS:
    from raven.contrib.django.raven_compat.middleware.wsgi import Sentry
    application = Sentry(get_wsgi_application())
else:
    from django.core.wsgi import get_wsgi_application
    application = get_wsgi_application()
