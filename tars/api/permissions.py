import logging

from django.conf import settings
from constance import config

from rest_framework import permissions

from tars.deployment.models import TarsDeploymentAction
from tars.application.models import Application

logger = logging.getLogger(__name__)


class IsDebugMode(permissions.BasePermission):
    def has_permission(self, request, view):
        if getattr(settings, 'DEBUG', False):
            return True
        return False

class PostOnlyAuth(permissions.IsAuthenticated):

    def has_permission(self, request, view):
        if request.method == 'POST' and view.action is not None:

            if super(PostOnlyAuth, self).has_permission(request, view):
                return True
            else:
                app_id = request.data.get('application') or view.get_object().application_id
                TarsDeploymentAction.objects.create(
                    action='auth',
                    operator=request.user.username,
                    message='permission deny on {} of application {}'.format(view.action, app_id))
                return False
        else:
            return True
