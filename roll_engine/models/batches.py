from __future__ import absolute_import

from django.db import models

from roll_engine.fsm import BatchFSMixin
from roll_engine.mixins import BatchMixin
from roll_engine.exceptions import DeploymentError
from .base import FSMedModel, InheritanceMetaclass


class DeploymentBatch(BatchMixin, BatchFSMixin, FSMedModel):
    __metaclass__ = InheritanceMetaclass

    index = models.IntegerField(null=True)
    pause_time = models.IntegerField(default=0)
    FORT_INDEX = 1

    class Meta:
        abstract = True

    @classmethod
    def validate_meta(cls):
        pass

    def get_object(self):
        return self

    def is_fort_batch(self):
        raise DeploymentError('return boolean to indicate whether a fort batch')

    def save(self, *args, **kwargs):
        if self.pk is None:
            if self.deployment is not None:
                self.pause_time = self.deployment.config.pause_time
        super(DeploymentBatch, self).save(*args, **kwargs)

    def is_reach_up_server_threshold(self):
        return False
