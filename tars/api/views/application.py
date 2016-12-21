import json
import logging
from datetime import date

from django.shortcuts import get_object_or_404
from django.db.models import Min
from django.http import QueryDict

from constance import config
from rest_framework.status import HTTP_400_BAD_REQUEST, HTTP_201_CREATED
from rest_framework import viewsets, filters
from rest_framework.response import Response
from rest_framework.decorators import detail_route, list_route
from djangorestframework_camel_case.util import underscoreize

from tars.api import serializers
from tars.application.models import Application, Package
from tars.api.decorators import (deployment, ids, created_from, created_before,
                                 status, running, app_status, log_request,
                                 last_success_package, last_success_deployment)
from tars.api.utils import fade_back_date, summarize_apps
from tars.api.permissions import IsDebugMode
from tars.deployment.models import TarsDeployment
from tars.deployment.tasks import TarsTasks
from tars.server.models import Group, JoinedGroup

logger = logging.getLogger(__name__)


class ApplicationViewSet(viewsets.ModelViewSet):
    """
    Application resource
    ---
    create:
        omit_parameters:
            - form
            - query
        parameters:
            - name: body
              pytype: serializers.ApplicationSerializer
              paramType: body
    """

    def get_serializer(self, *args, **kwargs):
        data = kwargs.get("data")
        if (data is not None and
                (isinstance(data, list) or isinstance(data.get('data'), list))):
            kwargs["many"] = True
        return super(ApplicationViewSet, self).get_serializer(*args, **kwargs)

    queryset = Application.objects.all()
    serializer_class = serializers.ApplicationSerializer
    filter_backends = (filters.DjangoFilterBackend, filters.SearchFilter)
    search_fields = ('name', 'id')

    def list(self, request, format=None):
        """
        Return a list of applications
        ---
        parameters:
            - name: created_from
              description: >
                filter in applications created from given date in date format
              type: date-time
              paramType: query
            - name: app_id
              description: >
                filter in applications matching given app_id (not primary key)
              type: integer
              paramType: query
            - name: search
              description: >
                fuzzy filter in applications whose app_id or name matched
              type: string
              paramType: query
            - name: status
              description: >
                filter in applications whose groups contain given status
              type: string
              paramType: query
        """
        @app_status
        @created_from()
        @ids(param='app_id', field='id')
        def get_queryset(self, request):
            return self.filter_queryset(self.get_queryset())

        queryset = get_queryset(self, request)
        if request.QUERY_PARAMS.get('app_id') is not None:
            serializer = self.get_serializer(
                queryset, many=True, context={'request': request})
            kwargs = {'ignored_fields': tuple()}
        else:
            serializer = serializers.ApplicationSimpleSerializer(
                queryset, many=True, context={'request': request})
            kwargs = {}
        return Response(serializer.get_paginated_data(**kwargs))

    @detail_route(methods=['get'])
    def packages(self, request, pk=None, format=None):
        """
        Return a list of packages of a application
        ---
        response_serializer: serializers.PackageSerializer
        parameters:
            - name: last_success
              description: >
                return only the last success package if set to True
              type: boolean
              paramType: query
            - name: deployment
              description: filter in by pk of deployment instance
              type: string
              paramType: query
        """

        @last_success_package()
        @deployment()
        def get_queryset(self, request):
            return app.packages.order_by('-created_at')

        app = self.get_object()
        queryset = get_queryset(self, request)
        try:
            serializer = serializers.PackageSerializer(
                queryset, context={'request': request}, many=True)
            packages = serializer.get_page()
        except Exception as e:
            return Response(str(e), status=HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.get_paginated_data())

    @detail_route(methods=['get'])
    def groups(self, request, pk=None, format=None):
        """
        Return a list of groups of a application
        ---
        response_serializer: serializers.GroupSerializer
        """
        self.sync(request, pk=pk, format=format)
        app = self.get_object()

        g_ids_in_joins = JoinedGroup.objects.filter(application_id=app.pk)\
                                            .values_list("aggregation", flat=True)
        groups = app.groups.exclude(id__in=g_ids_in_joins)

        try:
            serializer = serializers.GroupSerializer(
                groups, context={'request': request}, many=True)
        except Exception as e:
            return Response(str(e), status=HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.get_paginated_data())

    @detail_route(methods=['post'])
    def sync(self, request, pk=None, format=None):
        """
        Syncing application with cms
        ---
        parameters_strategy:
            form: replace
        parameters:
            - name: ignore_setting
              description: >
                ignore cms syncing flag in setting.py or not
              type: boolean
              paramType: form
        """
        app = self.get_object()
        try:
            app.sync_cms()
        except Exception as e:
            return Response(str(e), status=HTTP_400_BAD_REQUEST)
        else:
            return self.retrieve(request, pk=pk)

    @detail_route(methods=['get'])
    def servers(self, request, pk=None, format=None):
        """
        Return a list of servers of a application
        which will be ordered by batch index if deployment is setted
        ---
        response_serializer: serializers.ServerSerializer
        parameters:
            - name: deployment
              description: >
                filter in servers of a application
                which involved in the given deployment
              type: integer
              paramType: query
        """
        from tars.server.models import Server

        app = self.get_object()
        deployment_id = request.QUERY_PARAMS.get('deployment')
        tgt_list = []

        if deployment_id is not None:
            deployment = get_object_or_404(app.deployments, pk=deployment_id)
            server_ids = deployment.targets.order_by('batch__index')\
                .values_list('server_id', flat=True)
            queryset = Server.objects.filter(id__in=server_ids)
        else:
            queryset = app.servers()

        serializer = serializers.ServerSerializer(
            queryset, many=True,
            context={'request': request, 'targets': tgt_list,
                     'hide_target': deployment_id is None})
        return Response(serializer.get_paginated_data())

    @detail_route(methods=['get'])
    def summary(self, request, pk=None, format=None):
        """
        Return summary of a application
        ---
        response_serializer: serializers.ApplicationSummarySerializer
        """
        app = self.get_object()
        serializer = serializers.ApplicationSummarySerializer(app)
        return Response(serializer.data)

    @detail_route(methods=['get'])
    @log_request(logger=logger)
    def deployments(self, request, pk=None, format=None):
        """
        Return a list of deployments of an application
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
            - name: group
              description: >
                filter in deployments belong to given id
              type: integer
              paramType: query
            - name: group_id
              description: >
                filter in deployments belong to given group_id (NOT primary key)
              type: integer
              paramType: query
            - name: package_id
              description: >
                filter in deployments with give package id
              type: integer
              paramType: query
        """
        @created_from()
        @running()
        @last_success_deployment()
        @status(param='deployment_status')
        @ids(param='group_id', field='group__group_id')
        @ids(param='package', field='package_id')
        def get_queryset(self, request, tars_group_id=None):
            deploy_qs = app.deployments

            if tars_group_id:
                deploy_qs = app.groups.get(pk=tars_group_id).merge_deploys

            return deploy_qs.order_by('-id')

        app = self.get_object()
        group_id = request.QUERY_PARAMS.get('group_id')
        queryset = get_queryset(self, request, request.QUERY_PARAMS.get('group'))


        rerollable_ids = app.rerollable_deployment_ids(group_id=group_id)

        serializer = serializers.DeploymentSerializer(
            queryset, many=True,
            context={'request': request,
                     'expand_package': True, 'expand_group': True,
                     'rerollable_ids': rerollable_ids})

        return Response(serializer.get_paginated_data())

    @detail_route(methods=['post'])
    def ping(self, request, pk=None, format=None):
        app = self.get_object()
        salt_profile = app.salt_client
        servers = set(app.servers().values_list('hostname', flat=True))
        timeout = request.QUERY_PARAMS.get('timeout', 32)

        try:
            task = TarsTasks.ping.s(TarsTasks, salt_profile, ','.join(servers))
            result = task.delay().get(timeout=timeout)
        except Exception as e:
            return Response(str(e), status=HTTP_400_BAD_REQUEST)
        else:
            return Response(result)

    @list_route(methods=['get'])
    def onboard(self, request):
        """
        Return application onboarding during a period of time

        onboarded application is the one which has been successful deployment in
        tars, and onboarding time of application is the 'created_at' field of
        its first successful deployment.
        ---
        parameters:
            - name: from
              description: >
                filter in onboard applications from given date in date format
              type: date-time
              paramType: query
            - name: to
              description: >
                filter in onboard applications before given date in date format
              type: date-time
              paramType: query
        """
        @created_from(param='from')
        @created_before(param='to')
        @ids(param='id', field='application_id')
        def get_queryset(self, request):
            return self.filter_queryset(
                TarsDeployment.objects.filter(status__exact='SUCCESS'))

        # query today's onboard application as defalut action
        if (request.QUERY_PARAMS.get('from') is None
                and request.QUERY_PARAMS.get('to') is None):
            query_dict = request.QUERY_PARAMS.copy()
            query_dict['from'] = date.today().isoformat()
            request._request.GET = query_dict

        success_deploys = get_queryset(self, request)

        # filter related_apps which may be hited application
        related_app_ids = success_deploys.values_list(
            'application', flat=True).distinct()
        if related_app_ids:
            # get first successful deployment id of all related_apps
            request._request.GET = QueryDict(
                'id={}'.format(','.join([str(id) for id in related_app_ids])))
            success_deploys_of_related_app = get_queryset(self, request)
            app_and_deploy = success_deploys_of_related_app\
                .values('application').annotate(first_deployment=Min('id'))
            first_deploy_ids = [i['first_deployment'] for i in app_and_deploy]

            new_app_raw = success_deploys.filter(id__in=first_deploy_ids)\
                .values_list('application', 'application__organization')
        else:
            new_app_raw = []

        return Response(summarize_apps(new_app_raw))

    @list_route(methods=['get'])
    def active(self, request):
        """
        Return application which deployed successful during a period of time

        ---
        parameters:
            - name: from
              description: >
                filter in applications with deployment from given date in date
                format, use default value 'today' if not given
              type: date-time
              paramType: query
            - name: to
              description: >
                filter in applications with deployment before given date in
                date format
              type: date-time
              paramType: query
        """
        @created_from(param='from')
        @created_before(param='to')
        @ids(param='_id', field='application_id')
        def get_queryset(self, request):
            return TarsDeployment.objects.all()

        query_dict = request.QUERY_PARAMS.copy()
        # query active application in today
        if request.QUERY_PARAMS.get('from') is None:
            query_dict['from'] = date.today().isoformat()

        apps = Application.objects.filter(
            created_at__lt=query_dict['from']).values_list('id', flat=True)
        query_dict['_id'] = ','.join(map(str, apps))
        request._request.GET = query_dict

        active_apps = get_queryset(self, request).filter(
            status__exact='SUCCESS').values_list(
            'application_id', 'application__organization').distinct()

        return Response(summarize_apps(active_apps))

    @list_route(methods=['get'])
    def inactive(self, request):
        """
        Return onboarded application but no deployment during a period of time

        ---
        parameters:
            - name: from
              description: >
                filter in applications with no deployment from given date in date
                format, use default value 3 months ago if not given
              type: date-time
              paramType: query
            - name: to
              description: >
                filter in applications with no deployment before given date in
                date format
              type: date-time
              paramType: query
        """
        @created_from(param='from')
        @created_before(param='to')
        @ids(param='_id', field='application_id')
        def get_queryset(self, request):
            return TarsDeployment.objects.all()

        query_dict = request.QUERY_PARAMS.copy()
        # query non active application in 3 month
        if request.QUERY_PARAMS.get('from') is None:
            query_dict['from'] = fade_back_date(date.today(), 3).isoformat()
        apps = Application.objects.filter(
            created_at__lt=query_dict['from']).values_list('id', flat=True)
        query_dict['_id'] = ','.join(map(str, apps))
        request._request.GET = query_dict

        active_apps = get_queryset(self, request).values_list(
            'application_id', flat=True).distinct()
        raw_dumb_apps = TarsDeployment.objects.filter(
            application__in=[i for i in apps if i not in active_apps],
            status__exact='SUCCESS').values_list(
                'application', 'application__organization').distinct()

        return Response(summarize_apps(raw_dumb_apps))

    @detail_route(methods=['post', 'get'])
    def join_groups(self, request, pk=None):
        """
        post {"aggregate_on": [1, 2, 3]} to generate a new JoinedGroup on this application
        """
        serializer_class = serializers.JoinedGroupSerializer

        if request.method == 'POST':
            data = dict(request.data, application=pk)
            serializer = serializer_class(data=data)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response(serializer.data, status=HTTP_201_CREATED)
        else:
            joined_groups = self.get_object().groups.filter(g_type=Group.G_TYPE_ENUM.join)
            return Response(serializer_class(joined_groups, many=True).data)


class PackageViewSet(viewsets.ModelViewSet):
    """ Package resource. """

    queryset = Package.objects.all()
    serializer_class = serializers.PackageSerializer

    def list(self, request, format=None):
        @ids(param='package', field='id')
        def get_queryset(self, request):
            return self.filter_queryset(self.get_queryset())

        queryset = get_queryset(self, request)
        serializer = self.get_serializer(queryset, many=True,
                                         context={'request': request})
        if request.QUERY_PARAMS.get('package') is not None:
            kwargs = {'ignored_fields': tuple()}
        else:
            kwargs = {}
        return Response(serializer.get_paginated_data(**kwargs))

