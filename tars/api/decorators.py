from functools import wraps

from django.db.models import Max

from tars.api.utils import str2bool, convert_status
from tars.deployment.constants import HALTED, SUCCESS
from tars.deployment.models import TarsDeployment, TarsFortDeployment


def fort_batch(param='fort_batch'):
    def decorator(func):
        @wraps(func)
        def func_wrapper(*args, **kwargs):
            queryset = func(*args, **kwargs)
            request = args[1]
            fort_batch_id = None
            if isinstance(args[0], TarsFortDeployment):
                fort_batch_id = args[0].get_fort_batch().id
            is_fort_batch = str2bool(request.QUERY_PARAMS.get(param))

            if is_fort_batch is not None:
                if is_fort_batch:
                    queryset = queryset.filter(id=fort_batch_id)
                else:
                    queryset = queryset.exclude(id=fort_batch_id)
            return queryset
        return func_wrapper
    return decorator


def running(param='running'):
    def decorator(func):
        @wraps(func)
        def func_wrapper(*args, **kwargs):
            queryset = func(*args, **kwargs)
            request = args[1]
            is_running = str2bool(request.QUERY_PARAMS.get(param))
            if is_running is not None:
                if is_running:
                    return queryset.exclude(status__in=HALTED)
                else:
                    return queryset.filter(status__in=HALTED)
            return queryset
        return func_wrapper
    return decorator


def last_success_deployment(param='last_success'):
    def decorator(func):
        @wraps(func)
        def func_wrapper(*args, **kwargs):
            queryset = func(*args, **kwargs)
            request = args[1]
            last_success = str2bool(request.QUERY_PARAMS.get(param))
            if last_success:
                queryset = queryset.order_by(
                    '-created_at').filter(status=SUCCESS)[:1]
            return queryset
        return func_wrapper
    return decorator


def status(param='status'):
    def decorator(func):
        @wraps(func)
        def func_wrapper(*args, **kwargs):
            queryset = func(*args, **kwargs)
            request = args[1]
            query_param_status = request.QUERY_PARAMS.get(param)
            if query_param_status is not None:
                statuses = query_param_status.split(',')
                queryset = queryset.filter(status__in=statuses)
            return queryset
        return func_wrapper
    return decorator


def deployment(param='deployment'):
    def decorator(func):
        @wraps(func)
        def func_wrapper(*args, **kwargs):
            queryset = func(*args, **kwargs)
            request = args[1]
            deployment_id = request.QUERY_PARAMS.get(param)
            if deployment_id is not None:
                queryset = queryset.filter(
                    pk=TarsDeployment.objects.get(pk=deployment_id).package_id)
            return queryset
        return func_wrapper
    return decorator


def last_success_package(param='last_success'):
    def decorator(func):
        @wraps(func)
        def func_wrapper(*args, **kwargs):
            queryset = func(*args, **kwargs)
            request = args[1]
            last_success = str2bool(request.QUERY_PARAMS.get(param))
            if last_success:
                last_success_ids = queryset.filter(status=SUCCESS).annotate(max_pk=Max('pk'))
                queryset = queryset.filter(pk__in=last_success_ids.values('max_pk'))
            return queryset
        return func_wrapper
    return decorator


def created_from(param='created_from'):
    def decorator(func):
        @wraps(func)
        def func_wrapper(*args, **kwargs):
            queryset = func(*args, **kwargs)
            request = args[1]
            query_param_date = request.QUERY_PARAMS.get(param)
            if query_param_date is not None:
                queryset = queryset.filter(created_at__gte=query_param_date)
            return queryset
        return func_wrapper
    return decorator


def created_before(param='created_before'):
    def decorator(func):
        @wraps(func)
        def func_wrapper(*args, **kwargs):
            queryset = func(*args, **kwargs)
            request = args[1]
            query_param_date = request.QUERY_PARAMS.get(param)
            if query_param_date is not None:
                queryset = queryset.filter(created_at__lt=query_param_date)
            return queryset
        return func_wrapper
    return decorator


def ids(param, field):
    def decorator(func):
        @wraps(func)
        def func_wrapper(*args, **kwargs):
            queryset = func(*args, **kwargs)
            request = args[1]
            query_param_id = request.QUERY_PARAMS.get(param)
            if query_param_id is not None:
                ids = query_param_id.split(',')
                kwargs = {'{0}__in'.format(field): ids}
                queryset = queryset.filter(**kwargs)
            return queryset
        return func_wrapper
    return decorator


def app_status(func):
    @wraps(func)
    def func_wrapper(*args, **kwargs):
        queryset = func(*args, **kwargs)
        request = args[1]
        query_param_status = request.QUERY_PARAMS.get('status')
        if query_param_status is not None:
            from django.db.models import F
            from tars.deployment.models import Deployment

            statuses = query_param_status.split(',')
            statuses = convert_status(statuses)
            app_ids = [d['group__application_id'] for d in Deployment.objects
                       .annotate(max_deployment=Max('group__deployments__id'))
                       .filter(id=F('max_deployment'), status__in=statuses)
                       .values('group__application_id')]
            return queryset.filter(id__in=app_ids)
        return queryset
    return func_wrapper


def log_request(logger=None):
    def decorator(func):
        @wraps(func)
        def func_wrapper(*args, **kwargs):
            request = args[1]
            body = request.body
            if logger is not None:
                logger.info("url: {}, body: {}".format(request.path, body))
            return func(*args, **kwargs)
        return func_wrapper
    return decorator


def clean_request_data(func):
    @wraps(func)
    def func_wrapper(*args, **kwargs):
        request = args[1]
        data = request.data
        request._full_data = {k: v for k, v in data.items() if v is not None}
        return func(*args, **kwargs)
    return func_wrapper
