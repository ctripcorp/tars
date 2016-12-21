import json
import copy

from rest_framework.test import APITestCase
from djangorestframework_camel_case.util import underscoreize

from tars.application.models import Application


class TestApplicationAPI(APITestCase):

    url = '/api/v1/applications'
    data = [
        {
            "name": "app1",
            "app_id": 1,
            "environment": "uat",
            "ignore_fort": "False"
        },
        {
            "name": "app2",
            "app_id": 2,
            "environment": "uat",
            "ignore_fort": "False"
        }
    ]

    def setUp(self):
        for item in self.data:
            item = {('id' if k == 'app_id' else k): v for k, v in item.items()}
            Application.objects.create(**item)

    def test_get(self):
        response = self.client.get(self.url, format='json')
        self.assertEqual(response.status_code, 200)
        app_list = underscoreize(
            json.loads(response.content))['data']['results']
        self.assertEqual(len(app_list), len(self.data))

    def test_post(self):
        post_data = dict(sync="False", data=self.data)
        # Change app_id
        post_data['data'] = [d.update(app_id=d['app_id']*10) or d
                             for d in self.data]

        response = self.client.post(self.url, post_data, format='json')
        self.assertEqual(response.status_code, 201)

    def test_app_id_confict_in_diff_list(self):
        data = copy.deepcopy(self.data)
        data[0]['app_id'] = 3  # app_id of data[1] conflicts
        post_data = dict(sync="False", data=data)

        response = self.client.post(self.url, post_data, format='json')
        self.assertEqual(response.status_code, 400)

    def test_app_id_confict_in_single_list(self):
        data = copy.deepcopy(self.data)
        data[0]['app_id'] = data[1]['app_id'] = 4  # has same app_id
        post_data = dict(sync="False", data=data)

        response = self.client.post(self.url, post_data, format='json')
        self.assertEqual(response.status_code, 400)

    def test_blanked_app_id(self):
        data = copy.deepcopy(self.data)
        data[0].pop('app_id')  # data[0] has no app_id attribute
        post_data = dict(sync="False", data=data)

        response = self.client.post(self.url, post_data, format='json')
        self.assertEqual(response.status_code, 400)

    def test_post_with_conflict_app_id(self):
        response = self.client.post(self.url, self.data, format='json')
        self.assertEqual(response.status_code, 400)

    def test_preview(self):
        post_data = dict(sync="False", preview="True", data=self.data)
        post_data['data'] = [d.update(app_id=d['app_id']*100) or d
                             for d in self.data]
        self.client.post(self.url, post_data, format='json')
        response = self.client.post(self.url, post_data, format='json')
        app_list = underscoreize(json.loads(response.content))['data']
        origin_count = Application.objects.all().count()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(post_data['data']), len(app_list))
        # no real db inssertation
        self.assertEqual(origin_count, Application.objects.all().count())
