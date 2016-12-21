import json

from constance import config
from rest_framework.test import APITestCase
from djangorestframework_camel_case.util import underscoreize

from roll_engine import constants as _
from tars.deployment.models import TarsDeployment, TarsDeploymentConfig, TarsDeploymentBatch
from tars.application.models import Application, Package
from tars.server.models import Group, Server


class TestDeploymentAPI(APITestCase):
    url = '/api/v1/deployments'

    def setUp(self):
        self.app = Application.objects.create(id=1, name="test_app")
        self.uat_pkg = Package.objects.create(id=1, application=self.app, status="SUCCESS", rop_status=None)
        self.group_1 = Group.objects.create(id=1, application=self.app, group_id=1001, name="Group_1")
        self.group_2 = Group.objects.create(id=2, application=self.app, group_id=1002, name="Group_2")
        self.config = TarsDeploymentConfig.objects.create(id=1, batch_pattern="25%")
        self.server_1 = Server.objects.create(id=1, hostname="server_1", group=self.group_2)
        self.server_2 = Server.objects.create(id=2, hostname="server_2", group=self.group_2)

    def test_deployment_rollback_chain(self):
        start_idx = 10
        data = [{'id': idx, 'parent_id': idx-1 if idx > start_idx else None,
                 'package_id': 1000+idx}
                for idx in range(start_idx, start_idx+3)]  # initial data
        for item in data:
            TarsDeployment.objects.create(application_id=1, **item)

        url = '{base_url}/{pk}/{entry}'.format(base_url=self.url,
                                               pk=start_idx+len(data)-1,
                                               entry='rollback_chain')

        response = self.client.get(url, format='json')
        self.assertEqual(response.status_code, 200)

        rollback_chain = underscoreize(
            json.loads(response.content)['data']['results'])

        for idx, item in enumerate(data[1::-1]):
            self.assertEqual(rollback_chain[idx]['id'], item['id'])

    # simply_roll in UAT
    def test_simply_roll_from_rop(self):
        config.ENV = 'uat'
        endpoint = self.url + '/simply_roll'
        rop_id = 10000

        # create a previous running deploy w/ same group, see if next can revoke it
        first_id = TarsDeployment.objects.create(
            application=self.app, rop_id=rop_id, group=self.group_2, status=_.ROLLING_OUT, config=self.config).pk

        # ensure api serializer layer is stable
        rop_post = {
            'application': 1,
            'package': 1,
            'rop_id': 1
        }

        resp = self.client.post(endpoint, data=rop_post, format="json").content

        resp = json.loads(resp)

        second = TarsDeployment.objects.get(pk=resp['data']['id'])

        # create a previous running deploy, see if next can revoke it
        self.assertEqual(resp['status'], 200, msg="Should return 200 for ROP calling, resp: {}".format(resp))
        self.assertEqual(second.group_id, 2, msg="Should use last group if no group param is given")

        first = TarsDeployment.objects.get(pk=first_id)
        self.assertEqual(first.status, _.REVOKED, msg="Should revoke all previous non-terminated deployments on same group")

    def test_simply_roll_group_and_id(self):
        config.ENV = 'uat'
        endpoint = self.url + '/simply_roll'

        rop_post = {
            'application': 1,
            'package': 1,
            'deploy_id': 10000,
            'group': 1002
        }

        self.assertEqual(TarsDeploymentBatch.objects.count(), 0, msg="Should ensure have no batch before simply_roll test")

        resp = self.client.post(endpoint, data=rop_post, format="json").content
        resp = json.loads(resp)

        deploy = TarsDeployment.objects.get(pk=resp['data']['id'])

        self.assertEqual(resp['status'], 200, msg="Should be ok with group and deploy_id param")

        self.assertEqual(deploy.group.id, 2, msg="Should retrieve group use cms group")

        self.assertEqual(deploy.id, 10000, msg="Deployment id should be the one given")

        # if batches is empty, it means something wrong in workaround to change deployment id
        self.assertNotEqual(deploy.batches.count(), 0, msg="Batches should not be missing when specify deploy id")
