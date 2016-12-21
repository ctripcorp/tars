"""
Target FSM should have various states depends on the real situation,thus we only define
disabling related states. Most importantly, we don't and you NEED TO define a success
transition in your child FSM. Because batch/deployment finish_rolling tasks
rely on target SUCCESS status
"""
from __future__ import absolute_import

from roll_engine import constants as _

from . import transition


class TargetFSMixin(object):
    _all = set([_.PENDING,
                _.DISABLING,
                _.DISABLE_SUCCESS,
                _.DISABLE_FAILURE,
                _.ENABLING,
                _.ENABLE_SUCCESS,
                _.ENABLE_FAILURE]
               )

    def can_disabling(self):
        return self.batch.status == _.DEPLOYING

    @transition(source='*',
                target=_.REVOKED)
    def revoked(self):
        pass

    @transition(source=_.PENDING,
                target=_.DISABLING, conditions=[can_disabling])
    def disabling(self):
        pass

    # succeed
    @transition(source=_.DISABLING,
                target=_.DISABLE_SUCCESS)
    def disable_success(self):
        pass

    @transition(source=_.ENABLING,
                target=_.ENABLE_SUCCESS)
    def enable_success(self):
        pass

    # fail
    @transition(source=_.DISABLING,
                target=_.DISABLE_FAILURE)
    def disable_failure(self):
        pass

    @transition(source=_.ENABLING,
                target=_.ENABLE_FAILURE)
    def enable_failure(self):
        pass
