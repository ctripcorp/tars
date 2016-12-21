from datetime import datetime

from time import strftime
from django.db import models

models.options.DEFAULT_NAMES += ('smoke_success_status', 'batch_factory',
                                 'task_set', 'salt_timeout')


class SoftDeleteManager(models.Manager):
    ''' Use this manager to get objects that have a is_deleted field '''
    def get_queryset(self):
        return super(SoftDeleteManager, self).get_queryset().filter(
            is_deleted=False)

    def all_with_deleted(self):
        return super(SoftDeleteManager, self).get_queryset()

    def deleted_set(self):
        return super(SoftDeleteManager, self).get_queryset().filter(
            is_deleted=True)


class UnixTimestampField(models.DateTimeField):

    """UnixTimestampField: creates a DateTimeField that is represented on the
    database as a TIMESTAMP field rather than the usual DATETIME field.
    """

    def __init__(self, null=False, blank=False, **kwargs):
        super(UnixTimestampField, self).__init__(**kwargs)
        # default for TIMESTAMP is NOT NULL unlike most fields, so we have to
        # cheat a little:
        self.blank, self.isnull = blank, null
        # To prevent the framework from shoving in "not null".
        self.null = True

    def db_type(self, connection):
        typ = ['TIMESTAMP']
        # See above!
        if self.isnull:
            typ += ['NULL']
        if self.auto_created:
            typ += ['default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP']
        return ' '.join(typ)

    def to_python(self, value):
        if isinstance(value, int):
            return datetime.fromtimestamp(value)
        else:
            return models.DateTimeField.to_python(self, value)

    def get_db_prep_value(self, value, connection, prepared=False):
        if value is None:
            return None
        return strftime('%Y%m%d%H%M%S', value.timetuple())


class TimestampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    DataChange_LastTime = UnixTimestampField(auto_created=True, db_index=True, editable=False)

    class Meta:
        abstract = True
