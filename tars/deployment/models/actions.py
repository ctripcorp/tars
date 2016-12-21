from django.db import models

from deployments import TarsDeployment
from roll_engine.models import DeploymentAction


class TarsDeploymentAction(DeploymentAction):
    deployment = models.ForeignKey(
        TarsDeployment, related_name='actions', db_constraint=False, null=True)
    finish_time = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    class Meta:
        db_table = 'deployment_actions'

    def __unicode__(self):
        return self.action
