from constance import config
from rest_framework import viewsets, filters
from rest_framework.decorators import detail_route, list_route
from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST

from tars.exceptions import SyncError
from tars.server.models import Group, Server, JoinedGroup
from tars.api import serializers
from tars.api.decorators import (status, running, last_success_deployment, created_from)
from tars.api.utils import replace_hermes_header
from tars.api.permissions import IsDebugMode
from tars.deployment.models import TarsDeployment
from tars.deployment.tasks import TarsTasks


class ServerViewSet(viewsets.ModelViewSet):
    """ Server resource. """

    queryset = Server.objects.all()
    serializer_class = serializers.ServerSerializer

    @detail_route(methods=['post'])
    def ping(self, request, pk=None, format=None):
        server = self.get_object()
        salt_profile = server.group.application.salt_client
        timeout = request.QUERY_PARAMS.get('timeout', 32)

        try:
            task = TarsTasks.ping.s(TarsTasks, salt_profile, server.hostname)
            result = task.delay().get(timeout=timeout)
        except Exception as e:
            return Response(str(e), status=HTTP_400_BAD_REQUEST)
        else:
            return Response(result)


class GroupViewSet(viewsets.ModelViewSet):
    """ Group resource. """

    queryset = Group.objects.all()
    serializer_class = serializers.GroupSerializer

    def retrieve(self, request, pk=None):
        group = self.get_object()
        serializer_class = self.get_serializer_class()
        serializer = serializer_class(group, context={'request': request})
        # show package detail if retrieving for specific group
        serializer.fields['last_success_package']\
            .method_name = 'get_last_success_package_detail'
        return Response(serializer.data)

    @detail_route(methods=['get'])
    def servers(self, request, pk=None, format=None):
        """
        Return a list of servers of a group
        ---
        response_serializer: serializers.ServerSerializer
        """
        group = self.get_object()
        servers = group.servers.all()

        try:
            serializer = serializers.ServerSerializer(
                servers, context={'request': request}, many=True)
        except Exception as e:
            return Response(str(e), status=HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.get_paginated_data())

    @detail_route(methods=['get', 'post'])
    def rollback_deployment(self, request, pk=None, format=None):
        """
        Return rollback target deployment of a group
        ---
        response_serializer: serializers.DeploymentSerializer
        parameters_strategy:
            form: replace
        parameters:
            - name: deployment
              description: >
                the rollback deployment id
              type: integer
              paramType: form
        """
        group = self.get_object()
        try:
            context = {'request': request}
            if request.method == 'GET':
                deployment = group.rollback_deployment
                context.update({'expand_package': True, 'expand_group': True})
            else:
                deployment_id = request.data.get('deployment')
                deployment = group.rollback(deployment_id)

            serializer = serializers.DeploymentSerializer(deployment,
                                                          context=context)
        except Exception as e:
            return Response(str(e), status=HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.data)

    @detail_route(methods=['get'])
    def deployments(self, request, pk=None, format=None):
        """
        Return a list of deployments of a group
        ---
        response_serializer: serializers.DeploymentSerializer
        parameters:
            - name: created_from
              description: >
                filter in applications created from given date in date format
              type: date-time
              paramType: query
            - name: running
              description: >
                filter in deployments in running
                (not SUCCESS, FAILURE, or REVOKED) status
              type: boolean
              paramType: query
            - name: last_success
              description: >
                return only the last success deployment if set to True
              type: boolean
              paramType: query
            - name: deployment_status
              description: filter in deployments via its' status
              type: string
              paramType: query
        """
        @created_from()
        @running()
        @last_success_deployment()
        @status(param='deployment_status')
        def get_queryset(self, request):
            return group.merge_deploys.order_by('-created_at')

        group = self.get_object()
        queryset = get_queryset(self, request)
        serializer = serializers.DeploymentSerializer(
            queryset, many=True,
            context={'request': request, 'expand_package': True,
                     'rerollable_ids': group.rerollable_deployment_ids})

        return Response(serializer.get_paginated_data())

    @detail_route(methods=['get'])
    def preview_batches(self, request, pk=None, format=None):
        """
        Return batches result for preview before submit a deployment
        ---
        omit_serializer: true
        parameters:
            - name: batch_pattern
              required: True
              description: percentage pattern for slicing batches out
              type: string
              paramType: query
        type:
            batch_pattern:
                type: string
            result:
                type: array
        """
        group = self.get_object()
        batch_pattern = request.QUERY_PARAMS.get('batch_pattern')
        flavor = request.QUERY_PARAMS.get('flavor')

        try:
            if batch_pattern is None:
                raise Exception('batch_pattern is required in query params')
            if isinstance(flavor, basestring):
                flavor = TarsDeployment.get_internal_flavor(flavor)
            batch_pattern_str, batch_result = group.fetch_batches(
                batch_pattern, flavor=flavor)
        except Exception as e:
            return Response(str(e), status=HTTP_400_BAD_REQUEST)
        else:
            return Response({'batch_pattern': batch_pattern_str,
                             'result': batch_result})

    @detail_route(methods=['get'])
    def summary(self, request, pk=None, format=None):
        """
        Return summary of a group
        ---
        response_serializer: serializers.GroupSerializer
        """
        group = self.get_object()
        serializer = serializers.GroupSerializer(
            group, fields=('id', 'fort', 'server_num', 'packages',
                           'site_name', 'health_check_url'),
            ignored_fields=tuple())
        return Response(serializer.data)

    @detail_route(methods=['post'])
    def sync(self, request, pk=None, format=None):
        """
        Sync with remote group, return added and removed server list
        ---
        omit_parameters:
            - form
        parameters:
            - name: ignore_setting
              description: ignore sync setting in settings.py
              type: boolean
              paramType: query
        """
        group = self.get_object()

        try:
            group.sync_cms()
        except SyncError as e:
            return Response(str(e), status=HTTP_400_BAD_REQUEST)
        else:
            return self.retrieve(request, pk=pk)

    @detail_route(methods=['post'])
    def ping(self, request, pk=None, format=None):
        group = self.get_object()

        salt_profile = group.application.salt_client
        servers = group.servers.all().values_list('hostname', flat=True)
        timeout = request.QUERY_PARAMS.get('timeout', 32)

        try:
            task = TarsTasks.ping.s(TarsTasks, salt_profile, ','.join(servers))
            result = task.delay().get(timeout=timeout)
        except Exception as e:
            return Response(str(e), status=HTTP_400_BAD_REQUEST)
        else:
            return Response(result)


class JoinedGroupViewSet(viewsets.ModelViewSet):

    queryset = JoinedGroup.objects.all()
    serializer_class = serializers.JoinedGroupSerializer

