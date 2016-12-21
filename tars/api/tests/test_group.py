from rest_framework.test import APITestCase

from tars.application.models import Application
from tars.server.models import Group


class TestGroupAPI(APITestCase):
    url = '/api/v1/groups'
    data = [
        {
            'name': 'group1',
            'group_id': 1,
            'site_name': 'Ctrip',
            'fort': 'FORT1'
        },
        {
            'name': 'group2',
            'group_id': 2,
            'site_name': 'Ctrip',
            'fort': 'FORT2'
        }
    ]

    def setUp(self):
        app_data = {'name': 'app1', 'id': 1,
                    'environment': 'uat', 'ignore_fort': False}
        app = Application.objects.create(**app_data)

        for item in self.data:
            Group.objects.create(application=app, **item)

    def test_sync(self):
        pass
