from django.conf.urls import url, include

from rest_framework import routers

from tars.api.views import application as application_views
from tars.api.views import server as server_views
from tars.api.views import deployment as deployment_views
from tars.api.views import log as log_views


router = routers.DefaultRouter(trailing_slash=False)

router.register(r'applications', application_views.ApplicationViewSet)
router.register(r'packages', application_views.PackageViewSet)
router.register(r'groups', server_views.GroupViewSet)
router.register(r'join_groups', server_views.JoinedGroupViewSet)
router.register(r'servers', server_views.ServerViewSet)
router.register(r'deployments', deployment_views.DeploymentViewSet,
                base_name='deployment')
router.register(r'configs', deployment_views.DeploymentConfigViewSet)
router.register(r'batches', deployment_views.DeploymentBatchViewSet)
router.register(r'targets', deployment_views.DeploymentTargetViewSet)
router.register(r'actions', deployment_views.DeploymentActionViewSet)

urlpatterns = [
    url(r'^logs', log_views.LogViewSet.as_view({'get': 'list'})),
    url(r'^', include(router.urls)),
]
