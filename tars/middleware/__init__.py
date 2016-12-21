from __future__ import absolute_import

import threading
import logging

from django.conf import settings

from raven.contrib.django.raven_compat.middleware import is_ignorable_404


class Sentry4XXCatchMiddleware(object):

    def process_response(self, request, response):
        from raven.contrib.django.models import client

        if response.status_code < 400 or response.status_code > 450 or is_ignorable_404(request.get_full_path()) or not client.is_enabled():
            return response

        data = client.get_data_from_request(request)

        data.update({
            'level': logging.INFO,
            'logger': 'http{0}'.format(str(response.status_code)),
        })
        result = client.captureMessage(
            message='{0}: {1}'.format(getattr(response, 'status_text', 'Page Not Found'), request.build_absolute_uri()), data=data)
        if not result:
            return

        request.sentry = {
            'project_id': data.get('project', client.remote.project),
            'id': client.get_ident(result),
        }
        return response
