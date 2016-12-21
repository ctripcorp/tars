from __future__ import absolute_import

from roll_engine import constants as _
from roll_engine.utils.log import get_logger

from . import transition

re_logger = get_logger()


class BatchFSMixin(object):
    _all = set([_.PENDING,
                _.DEPLOYING,
                _.SUCCESS,
                _.FAILURE,
                _.REVOKED]
               )

    def can_deploy(self):
        is_reached = self.is_reach_up_server_threshold()
        if is_reached:
            deploy = self.deployment
            if not deploy.is_braked():
                re_logger.error('Braked for upped servers below minimum '
                                'threshold', extra=deploy.extras)
                deploy.brake()
        return not is_reached

    @transition(source='*',
                target=_.REVOKED)
    def revoked(self):
        pass

    @transition(source=[_.PENDING, _.FAILURE, _.SUCCESS],
                target=_.PENDING)
    def pending(self):
        pass

    # we can deploying on every state
    @transition(source=[_.PENDING, _.FAILURE, _.SUCCESS],
                target=_.DEPLOYING, conditions=[can_deploy])
    def deploying(self):
        pass

    @transition(source=_.DEPLOYING,
                target=_.SUCCESS)
    def success(self):
        pass

    @transition(source=_.DEPLOYING,
                target=_.FAILURE)
    def failure(self):
        pass
