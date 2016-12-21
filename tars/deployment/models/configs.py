from django.db import models
from roll_engine.models import DeploymentConfig


class TarsDeploymentConfig(DeploymentConfig):
    verify_timeout = models.IntegerField(null=True)
    startup_timeout = models.IntegerField(null=True)
    ignore_verify_result = models.BooleanField(default=False)
    restart_app_pool = models.BooleanField(default=False)

    class Meta:
        db_table = 'deployment_configs'

    def __unicode__(self):
        return self.batch_pattern
