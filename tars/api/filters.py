from rest_framework.filters import DjangoFilterBackend

from tars.api.decorators import status, running, ids


class StatusFilterBackend(DjangoFilterBackend):
    @status()
    def filter_queryset(self, request, queryset, view):
        queryset = super(StatusFilterBackend, self).filter_queryset(
            request, queryset, view)
        return queryset


class DeploymentFilterBackend(StatusFilterBackend):
    @running()
    @ids(param='app_id', field='application__id')
    def filter_queryset(self, request, queryset, view):
        queryset = super(DeploymentFilterBackend, self).filter_queryset(
            request, queryset, view)
        return queryset


class BatchFilterBackend(StatusFilterBackend):
    def filter_queryset(self, request, queryset, view):
        queryset = super(BatchFilterBackend, self).filter_queryset(
            request, queryset, view)
        return queryset
