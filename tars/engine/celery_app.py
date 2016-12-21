from django.conf import settings

from roll_engine.celery import app


if "raven.contrib.django.raven_compat" in settings.INSTALLED_APPS:
    import raven
    from raven.contrib.celery import register_logger_signal, register_signal

    client = raven.Client(settings.RAVEN_CONFIG['dsn'])

    # register a custom filter to filter out duplicate logs
    register_logger_signal(client)

    # hook into the Celery error handler
    register_signal(client)
