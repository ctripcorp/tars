import logging
import traceback

import django_filters
from rest_framework import viewsets
from rest_framework import status as HTTP_STATUS
from rest_framework.response import Response
from rest_framework.decorators import detail_route, list_route
from constance import config
try:
    from rest_client import get_tracker_client
    HAS_TRACKER = True
except ImportError:
    HAS_TRACKER = False

from roll_engine.exceptions import DeploymentError

from tars.deployment import models
from tars.api import serializers, filters
from tars.api.decorators import (fort_batch, status, log_request,
                                 clean_request_data)
from tars.api.permissions import IsDebugMode, PostOnlyAuth
from tars.utils import AdvancedPolymorph


logger = logging.getLogger(__name__)


class DeploymentConfigViewSet(viewsets.ModelViewSet):
    """
    Deployment Config resource.
    ---
    list:
        parameters:
            - name: batch_pattern
              description: >
                filter in deployment config by batch pattern
              type: string
              paramType: query
    """

    queryset = models.TarsDeploymentConfig.objects.all()
    serializer_class = serializers.DeploymentConfigSerializer
    filter_fields = ['batch_pattern']


class DeploymentFilter(django_filters.FilterSet):
    created_from = django_filters.DateTimeFilter(name="created_at",
                                                 lookup_type='gte')

    class Meta:
        model = models.TarsDeployment
        fields = ['application', 'group', 'package', 'rop_id', 'created_from']


class DeploymentViewSet(viewsets.ModelViewSet):
    """
    Deployment resource.
    ---
    list:
        parameters:
            - name: application
              description: >
                filter in deployment bound to a application
              type: string
              paramType: query
            - name: package
              description: >
                filter in deployment by package
              type: string
              paramType: query
            - name: running
              description: >
                filter in deployments in running status
                (not SUCCESS, FAILURE, or REVOKED)
              type: boolean
              paramType: query
            - name: rop_id
              description: >
              filter in deployments by rop id
              type: integer
              paramType: query
            - name: app_id
              description: >
                filter in applications matching give app_id (not application_id)
              type: integer
              paramType: query
    """
    queryset = models.TarsDeployment.objects.all()
    serializer_class = serializers.DeploymentSerializer
    filter_backends = (filters.DeploymentFilterBackend,)
    filter_class = DeploymentFilter
    permission_classes = [PostOnlyAuth]


    def create(self, request, *args, **kwargs):
        """
        create an deployment
        ---
        omit_parameters:
            - form
            - query
        parameters:
            - name: body
              pytype: serializers.DeploymentSerializer
              paramType: body
        """
        return super(DeploymentViewSet, self).create(request, *args, **kwargs)

    def retrieve(self, request, pk=None):
        deployment = self.get_object()
        serializer_class = self.get_serializer_class()
        ignored_fields = tuple(f for f in serializer_class.Meta.ignored_fields
                               if f != 'actions')
        serializer = serializer_class(
            deployment, context={'expand_package': True}, ignored_fields=ignored_fields)
        return Response(serializer.data)

    @list_route(methods=['post'], permission_classes=[IsDebugMode])
    def deploy_dt(self, request):
        data = request.data
        deploy_class_name = AdvancedPolymorph.get_decision('deploy', **data)
        return Response(deploy_class_name)

    @list_route(methods=['post'], permission_classes=[IsDebugMode])
    def slb_dt(self, request):
        data = request.data
        slb = AdvancedPolymorph.get_decision('slb', **data)
        return Response(slb)

    @list_route(methods=['post'], permission_classes=[])
    @log_request(logger=logger)
    @clean_request_data
    def simply_roll(self, request):
        """
        Raw API to immediately start rolling process directly without smoking
        validation If omit group_id, then tars will use last group of the
        specific application.
        ---
        parameters:
            - name: application
            - name: package, tars package id generated from repack or swift url
            - name: group, optional, (CMS) group id to retrieve server list
            - name: group_id, optional, same as group but prior to group param
            - name: deploy_id, optional, to specify pk
            - name: ignore_verify, optional, to set ignore_verify_result in
                    deployment config
        """
        data = request.data

        no_auto_start = data.get('no_auto_start', False)

        serializer = serializers.DeploymentSerializer4UAT(
            data=data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        try:
            deployment = serializer.save()
        except Exception:
            return Response(traceback.format_exc().splitlines(),
                            status=HTTP_STATUS.HTTP_400_BAD_REQUEST)
        else:
            # workaround: set viewset's id to enable get_object for simply_roll
            self.kwargs['pk'] = deployment.id

        if no_auto_start:
            return self.retrieve(request)
        else:
            return self._run('start', request)

    @detail_route(methods=['get'])
    def batches(self, request, pk=None, format=None):
        """
        Return batches of a deployment
        ---
        response_serializer: serializers.DeploymentBatchSerializer
        parameters:
            - name: fort_batch
              description: >
                return only fort batch
              type: boolean
              paramType: query
            - name: batch_status
              description: >
                filter in batches in batch status
              type: string
              paramType: query
        """
        @fort_batch()
        @status(param='batch_status')
        def get_queryset(deployment, request):
            return deployment.batches.all()

        deployment = self.get_object()
        queryset = get_queryset(deployment, request)
        serializer = serializers.DeploymentBatchSerializer(
            queryset, context={'request': request}, many=True)

        return Response(serializer.get_paginated_data())

    @detail_route(methods=['get'])
    def summary(self, request, pk=None, format=None):
        """
        Return summary of a deployment
        ---
        omit_serializer: true
        type:
            application:
                type: integer
            id:
                type: integer
            groups:
                type: array
        """
        deployment = self.get_object()
        serializer = serializers.DeploymentSummarySerializer(deployment)
        return Response(serializer.data)

    def _run(self, action, request):
        deployment = self.get_object()
        operator = request.user

        try:
            deployment.run(action, operator)
        except DeploymentError as e:
            return Response(str(e), status=HTTP_STATUS.HTTP_400_BAD_REQUEST)
        else:
            # NOTE: send events to tracker.
            try:
                if HAS_TRACKER and config.SEND_TRACKER and operator.id is not None:
                    # NOTE: post event data to tracker.
                    deployment.send_tracker_event({"action": action, "mail": operator.email, "user": operator.last_name})
            except AttributeError as e:
                pass

            return self.retrieve(request)

    @detail_route(methods=['post'])
    def start(self, request, pk=None, format=None):
        """
        Start deployment
        ---
        omit_parameters:
            - form
            - query
        """
        return self._run('start', request)

    @detail_route(methods=['post'])
    def smoke(self, request, pk=None, format=None):
        """
        Smoking
        ---
        omit_parameters:
            - form
            - query
        """
        return self._run('smoke', request)

    @detail_route(methods=['post'])
    def bake(self, request, pk=None, format=None):
        """
        Baking
        ---
        omit_parameters:
            - form
            - query
        """
        return self._run('bake', request)

    @detail_route(methods=['post'])
    def rollout(self, request, pk=None, format=None):
        """
        Rolling out
        ---
        omit_parameters:
            - form
            - query
        """
        return self._run('rollout', request)

    @detail_route(methods=['post'])
    def retry(self, request, pk=None, format=None):
        """
        Retry deployment
        ---
        omit_parameters:
            - form
            - query
        """
        deployment = self.get_object()
        deployment.update_batches()
        return self._run('retry', request)

    @detail_route(methods=['post'])
    def resume(self, request, pk=None, format=None):
        """
        Resume deployment
        ---
        omit_parameters:
            - form
            - query
        """
        return self._run('resume', request)

    @detail_route(methods=['post'])
    def brake(self, request, pk=None, format=None):
        """
        Brake deployment
        ---
        omit_parameters:
            - form
            - query
        """
        return self._run('brake', request)

    @detail_route(methods=['post'])
    def revoke(self, request, pk=None, format=None):
        """
        Revoke deployment
        ---
        omit_parameters:
            - form
            - query
        """
        return self._run('revoke', request)

    @detail_route(methods=['get'])
    def targets(self, request, pk=None, format=None):
        """
        Return deployment targets
        ---
        response_serializer: serializers.DeploymentTargetSerializer
        omit_parameters:
            - query
        """
        deployment = self.get_object()
        serializer = serializers.DeploymentTargetSerializer(
            deployment.targets, context={'request': request}, many=True)

        return Response(serializer.get_paginated_data())

    @detail_route(methods=['get'], permission_classes=[IsDebugMode])
    def rollback_chain(self, request, pk=None):
        """
        Return a list of deployments in rollback chain (debug only)
        ---
        response_serializer: serializers.DeploymentSerializer
        omit_parameters:
            - query
        """
        deployment = self.get_object()
        queryset = deployment.rollback_deployments
        serializer = serializers.DeploymentSerializer(
            queryset, many=True,
            context={'request': request, 'expand_package': True})

        fields = ('id', 'rop_id',  'flavor', 'status',
                  'package', 'parent', 'group', 'origin')
        return Response(serializer.get_paginated_data(fields=fields))

    @detail_route(methods=['post'], permission_classes=[IsDebugMode])
    def reset(self, request, pk=None, format=None):
        """
        temp for develop
        """
        deployment = self.get_object()
        deployment.reset()
        return self.retrieve(request)


class DeploymentBatchViewSet(viewsets.ModelViewSet):
    """
    Deployment Batch resource.
    ---
    list:
        parameters:
            - name: deployment
              description: >
                filter in deployment batches bound to a deployment
              type: string
              paramType: query
    """
    queryset = models.TarsDeploymentBatch.objects.all()
    serializer_class = serializers.DeploymentBatchSerializer
    filter_fields = ['deployment']
    filter_backends = (filters.BatchFilterBackend,)

    @detail_route(methods=['get'])
    def targets(self, request, pk=None, format=None):
        """
        Return targets bound to a batch
        ---
        response_serializer: serializers.DeploymentBatchSerializer
        parameters:
            - name: deployment
                description: >
                filter in deployment batches bound to a deployment
                type: string
                paramType: query
            - name: target_status
                description: >
                    filter in targets in target status
                type: string
                paramType: query
        """
        @status(param='target_status')
        def get_queryset(batch, request):
            return batch.targets.all()

        batch = self.get_object()
        queryset = get_queryset(batch, request)
        serializer = serializers.DeploymentTargetSerializer(
            queryset, context={'request': request}, many=True)

        return Response(serializer.get_paginated_data())


class DeploymentTargetViewSet(viewsets.ModelViewSet):
    """
    Deployment Target resource.
    ---
    list:
        parameters:
            - name: batch
              description: >
                filter in deployment batches bound to a deployment batch
              type: string
              paramType: query
            - name: status
              description: >
                filter in deployment by deployment status
              type: string
              paramType: query
    """
    queryset = models.TarsDeploymentTarget.objects.all().order_by('-id')
    serializer_class = serializers.DeploymentTargetSerializer
    filter_fields = ['batch', 'status', '_hostname']


class DeploymentActionViewSet(viewsets.ModelViewSet):
    """
    Deployment Action resource.
    """
    queryset = models.TarsDeploymentAction.objects.all()
    serializer_class = serializers.DeploymentActionSerializer
