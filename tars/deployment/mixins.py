import logging
import operator
import time

from django.db import transaction
from django.contrib.auth.models import User as django_user

from constance import config
from roll_engine.utils.log import get_logger
from django.test import RequestFactory
from rest_framework.request import Request

try:
    import json
    from rest_client import get_tracker_client
    from django.core import serializers as django_serializers
    HAS_TRACKER = True
except ImportError:
    HAS_TRACKER = False

from tars.utils import check_dict
from tars.deployment import constants

logger = logging.getLogger(__name__)
es_logger = get_logger()


class JobWSMixin(object):
    pass


class TrackerMixin(object):
    def _ignore_event(self, event_type):
        # workaround: for ROLLBACK\REROLL revoked the pre deployment..
        # NOTE: we assume that if ROLLBACK\REROLL revoked the pre deployment,
        # we will skip this ROLLBACK\REROLL and save the revoke event.
        if self.flavor == self.ROLLBACK:
            deployment = self.origin
        elif self.flavor == self.REROLL:
            deployment = self.group.merge_deploys.filter(id__lt=self.id).last()
        else:
            return False

        return event_type in ["TARS_ROLLBACK", "TARS_REROLL"] and getattr(deployment, 'status', None) == 'REVOKED'

    def _filter_event(self, extra_data):
        from tars.deployment.models.batches import TarsDeploymentFortBatch
        # SUCCESS/FAILURE will be determined by 'deploy_status'
        # REVOKE/ROLLBACK/REROLL will be determined by 'flavor' and log's 'detail'.

        _MAP = ( # and conditions
            (operator.is_not, "mail", None),
            [ # or conditions
                (operator.contains, "detail",
                 ["Deployment succeeded", "Deployment failed"]),
                (operator.contains, "action", ["revoke"]),
                ( # and conditions
                    (operator.eq, "action", "start"),
                    (operator.contains, "flavor", [self.ROLLBACK, self.REROLL])
                )
            ]
        )

        # workaround for event_type!!
        _EVENT_TYPE_MAPPING = {
            "SUCCESS": "TARS_SUCCESS",
            "FAILURE": "TARS_FAILURE",
            "revoke": "TARS_REVOKED",
            "start_{}".format(self.ROLLBACK): "TARS_ROLLBACK",
            "start_{}".format(self.REROLL): "TARS_REROLL"
        }

        orig_data = django_serializers.serialize('json', [self])
        event_data = json.loads(orig_data)[0]

        # NOTE: flatten the fields and extra data.
        event_data.update(event_data.get("fields", {}))
        event_data.pop("fields", None)
        event_data.update(extra_data, env=config.ENV)
        event_data.update({"app_name": self.application.name})

        # NOTE: dirty assign the lastname as username & dept.
        if "user" not in event_data:
            try:
                _user = django_user.objects.get(email=event_data.get("mail"))
                _event_username = _user.last_name
            except django_user.DoesNotExist:
                _event_username = ""
            event_data.update({"user": _event_username})

        event_data.update({"organization": self.application.organization}) \
            if "organization" not in event_data else None

        if check_dict(event_data, pattern=_MAP):
            # append event_type
            event_data["event_type"] = (
                _EVENT_TYPE_MAPPING.get(event_data["status"]) or
                _EVENT_TYPE_MAPPING.get(event_data.get("action")) or
                _EVENT_TYPE_MAPPING.get("{}_{}".format(
                    event_data.get("action"), event_data.get("flavor"))
                )
            )

            if (event_data['event_type'] == 'TARS_REVOKED'):
                if (isinstance(self.batches.first(), TarsDeploymentFortBatch) and self.batches.first().status != 'SUCCESS'):
                    event_data["event_type"] = "TARS_FORT_REVOKED"

            # NOTE: record filtered tars action\state event
            # NOTE: ignore sth..
            if self._ignore_event(event_data["event_type"]):
                return None

            if (event_data['event_type'] == 'TARS_FAILURE' and
                    self.targets.filter(status='VERIFY_FAILURE').exists()):
                deploy_targets = self.targets.filter(
                    status='VERIFY_FAILURE').values_list('id', flat=True)
                event_data['verify_log_url'] = (
                    '/api/v1/logs?deploy_id={}&deploy_target={}&'
                    'log_module=agent&log_level=info,error&'
                    'deploy_target_status=VERIFYING,VERIFY_FAILURE'.format(
                        self.id, ','.join([str(t) for t in deploy_targets]),
                    ))

            return event_data
        else:
            return None

    def send_tracker_event(self, data):
        if HAS_TRACKER:
            try:
                if not config.SEND_TRACKER:
                    return

                event_data = self._filter_event(data)
                if event_data is not None:
                    _tracker = get_tracker_client()
                    _tracker.create_event(topic="tars", event_data=event_data)
            except Exception as e:
                logger.warning("Failed to send event to tracker: {}".format(e))

    def get_target_logs(self, deploy_targets, status):
        from tars.api.views.log import LogQuerySet

        request_factory = RequestFactory()
        faked_request = Request(request_factory.get(
            '/api/v1/logs/',
            {'page_size': 100,
             'deploy_id': self.id,
             'deploy_target': ','.join([str(t) for t in deploy_targets]),
             'deploy_target_status': status}))
        log_queryset = LogQuerySet(faked_request)

        time.sleep(1)  # wait 1 sec to ensure related logs have been sent to es
        log_queryset._fetch_data()
        return log_queryset.logs
