from django.db import models

from roll_engine.db import TimestampedModel


class DeploymentConfig(TimestampedModel):
    MANUAL = 'm'
    AUTO = 'a'
    MODE_CHOICES = (
        (MANUAL, 'manual'),
        (AUTO, 'auto')
    )
    batch_pattern = models.CharField(max_length=300, null=True)
    pause_time = models.IntegerField(default=0)
    mode = models.CharField(max_length=1, choices=MODE_CHOICES, default=AUTO)

    class Meta:
        abstract = True

    def __unicode__(self):
        return self.batch_pattern
