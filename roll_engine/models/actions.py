from __future__ import absolute_import

from django.db import models

from roll_engine.db import TimestampedModel


class DeploymentAction(TimestampedModel):
    action = models.CharField(max_length=255, null=True, blank=True)
    message = models.CharField(max_length=255, null=True, blank=True)
    operator = models.CharField(max_length=55, null=True, blank=True)
    start_time = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    class Meta:
        abstract = True

    def __unicode__(self):
        return self.action
