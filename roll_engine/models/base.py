from __future__ import absolute_import

from django.db.models.base import ModelBase
from django.db.models.options import Options

from django_fsm import can_proceed, FSMField

from roll_engine.db import TimestampedModel
from roll_engine.constants import PENDING, REVOKED
from roll_engine.exceptions import StatusError
from roll_engine.utils.log import get_logger


re_logger = get_logger()


class RollEngineOptions(Options):
    @property
    def __parent_model(self):
        if self.proxy:
            return self.proxy_for_model
        else:
            for parent, _ in self.parents.items():
                return parent
        return None

    def __getattr__(self, attr):
        if attr in ('batch_factory', 'task_set', 'smoke_success_status',
                    'salt_timeout'):
            parent = self.__parent_model
            if parent is not None:
                return getattr(parent._meta, attr)
        raise AttributeError


class InheritanceMetaclass(ModelBase):
    def __new__(cls, name, bases, attr):
        klass = ModelBase.__new__(cls, name, bases, attr)
        klass.validate_meta()
        klass._meta.__class__ = RollEngineOptions
        return klass

    def __call__(cls, *args, **kwargs):
        obj = super(InheritanceMetaclass, cls).__call__(*args, **kwargs)
        return obj.get_object()


class FSMedModel(TimestampedModel):

    status = FSMField(max_length=32, null=True, blank=True,
                      default=PENDING)

    class Meta:
        abstract = True

    @property
    def extras(self):
        return {}

    def fetch_status(self):
        obj = self.__class__.objects.get(id=self.id)
        return obj.status

    def update_status(self, force=False):
        if not force and self.fetch_status() == REVOKED:
            raise StatusError('{} has been revoked.'.format(self))
        self.save(update_fields=['status', 'updated_at'])

    def trans(self, action=None, **kwargs):
        old_status = self.status = self.fetch_status()
        getattr(self, action.lower())()
        self.update_status(force=False)
        re_logger.info('%r changed from %s to %s' % (self, old_status,
                                                     self.status),
                       extra=self.extras)

    def next_user_actions(self):
        return [(ts.custom.get('alias') or ts.name)
                for ts in self.get_available_status_transitions()
                if ts.custom.get('user_action')]

    def can_trans(self, action):
        return can_proceed(getattr(self, action.lower()))

    def safe_trans(self, action=None):
        if self.can_trans(action):
            self.trans(action)
            return True
        else:
            return False

    def get_extras(self):
        """ would be deprecated soon """
        return {}
