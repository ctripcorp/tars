from __future__ import absolute_import

from roll_engine import constants as _
from roll_engine.utils.log import get_logger

from . import transition

re_logger = get_logger()


class _BrakeFSMixin(object):
    _all = set([_.ROLLOUT_SUCCESS_BRAKED,
                _.ROLLOUT_FAILURE_BRAKED,
                _.ROLLOUT_BRAKED]
               )

    def can_brake(self):
        return self.can_brake()

    @transition(source=_.ROLLING_OUT,
                target=_.ROLLOUT_BRAKED,
                conditions=[can_brake],
                custom=dict(user_action=True, alias='brake'))
    def rolling_out_brake(self):
        pass

    @transition(source=_.BAKE_SUCCESS,
                target=_.ROLLOUT_SUCCESS_BRAKED,
                conditions=[can_brake],
                custom=dict(user_action=True, alias='brake'))
    def rollout_success_brake(selF):
        pass

    @transition(source=_.BAKE_FAILURE,
                target=_.ROLLOUT_FAILURE_BRAKED,
                conditions=[can_brake],
                custom=dict(user_action=True, alias='brake'))
    def rollout_failure_brake(selF):
        pass

    @transition(source=_.ROLLOUT_BRAKED,
                target=_.ROLLING_OUT,
                custom=dict(user_action=True, alias='resume'))
    def rollout_braked_resume(self):
        pass

    @transition(source=_.ROLLOUT_SUCCESS_BRAKED,
                target=_.BAKE_SUCCESS,
                custom=dict(user_action=True, alias='resume'))
    def rollout_success_braked_resume(self):
        pass

    @transition(source=_.ROLLOUT_FAILURE_BRAKED,
                target=_.BAKE_FAILURE,
                custom=dict(user_action=True, alias='resume'))
    def rollout_failure_braked_resume(self):
        pass


class _FortBrakeFSMixin(_BrakeFSMixin):
    _all = _BrakeFSMixin._all | set([_.SMOKE_SUCCESS_BRAKED,
                                     _.SMOKE_FAILURE_BRAKED,
                                     _.SMOKE_BRAKED,
                                     _.BAKE_SUCCESS_BRAKED,
                                     _.BAKE_FAILURE_BRAKED,
                                     _.BAKE_BRAKED,
                                     _.ROLLOUT_SUCCESS_BRAKED,
                                     _.ROLLOUT_FAILURE_BRAKED,
                                     _.ROLLOUT_BRAKED]
                                    )

    def can_brake(self):
        return super(_FortBrakeFSMixin, self).can_brake()

    @transition(source=_.SMOKING,
                target=_.SMOKE_BRAKED,
                conditions=[can_brake],
                custom=dict(user_action=True, alias='brake'))
    def smoking_brake(self):
        pass

    @transition(source=_.BAKING,
                target=_.BAKE_BRAKED,
                conditions=[can_brake],
                custom=dict(user_action=True, alias='brake'))
    def baking_brake(self):
        pass

    @transition(source=_.SMOKE_SUCCESS,
                target=_.SMOKE_SUCCESS_BRAKED,
                conditions=[can_brake],
                custom=dict(user_action=True, alias='brake'))
    def smoke_success_brake(self):
        pass

    @transition(source=_.BAKE_SUCCESS,
                target=_.BAKE_SUCCESS_BRAKED,
                conditions=[can_brake],
                custom=dict(user_action=True, alias='brake'))
    def bake_success_brake(self):
        pass

    @transition(source=_.SMOKE_FAILURE,
                target=_.SMOKE_FAILURE_BRAKED,
                conditions=[can_brake],
                custom=dict(user_action=True, alias='brake'))
    def smoke_failure_brake(self):
        pass

    @transition(source=_.BAKE_FAILURE,
                target=_.BAKE_FAILURE_BRAKED,
                conditions=[can_brake],
                custom=dict(user_action=True, alias='brake'))
    def bake_failure_brake(self):
        pass

    @transition(source=_.SMOKE_BRAKED,
                target=_.SMOKING,
                custom=dict(user_action=True, alias='resume'))
    def smoke_braked_resume(self):
        pass

    @transition(source=_.BAKE_BRAKED,
                target=_.BAKING,
                custom=dict(user_action=True, alias='resume'))
    def bake_braked_resume(self):
        pass

    @transition(source=_.SMOKE_SUCCESS_BRAKED,
                target=_.SMOKE_SUCCESS,
                custom=dict(user_action=True, alias='resume'))
    def smoke_success_braked_resume(self):
        pass

    @transition(source=_.BAKE_SUCCESS_BRAKED,
                target=_.BAKE_SUCCESS,
                custom=dict(user_action=True, alias='resume'))
    def bake_success_braked_resume(self):
        pass

    @transition(source=_.SMOKE_FAILURE_BRAKED,
                target=_.SMOKE_FAILURE,
                custom=dict(user_action=True, alias='resume'))
    def smoke_failure_braked_resume(self):
        pass

    @transition(source=_.BAKE_FAILURE_BRAKED,
                target=_.BAKE_FAILURE,
                custom=dict(user_action=True, alias='resume'))
    def bake_failure_braked_resume(self):
        pass

    @transition(source=_.ROLLOUT_SUCCESS_BRAKED,
                target=_.ROLLOUT_SUCCESS,
                custom=dict(user_action=True, alias='resume'))
    def rollout_success_braked_resume(self):
        pass

    @transition(source=_.ROLLOUT_FAILURE_BRAKED,
                target=_.ROLLOUT_FAILURE,
                custom=dict(user_action=True, alias='resume'))
    def rollout_failure_braked_resume(self):
        pass


class _FSMixin(object):
    _terminals = set([_.SUCCESS, _.REVOKED])
    _all = set([_.PENDING,
                _.ROLLING_OUT,
                _.ROLLOUT_SUCCESS,
                _.ROLLOUT_FAILURE,
                _.SUCCESS,
                _.FAILURE,
                _.REVOKED]
               )

    @transition(source=_.ROLLOUT_FAILURE,
                target=_.FAILURE)
    def failure(self):
        pass

    @transition(source=_.PENDING,
                target=_.PENDING,
                custom=dict(user_action=True, alias='start'))
    def activate(self):
        pass

    @transition(source=_.ROLLOUT_SUCCESS,
                target=_.SUCCESS,
                custom=dict(user_action=True))
    def success(self):
        pass

    @transition(source=_.ROLLING_OUT,
                target=_.ROLLOUT_SUCCESS)
    def rollout_success(self):
        pass

    @transition(source=_.ROLLING_OUT,
                target=_.ROLLOUT_FAILURE)
    def rollout_failure(self):
        pass


class FSMixin(_BrakeFSMixin, _FSMixin):
    _brakes = _BrakeFSMixin._all
    _all = _brakes | _FSMixin._all

    @transition(source=list(_all - _FSMixin._terminals),
                target=_.REVOKED,
                custom=dict(user_action=True, alias='revoke'))
    def revoked(self):
        pass

    @transition(source=list(_all - _brakes - _FSMixin._terminals),
                target=_.PENDING)
    def pending(self):
        pass

    @transition(source=[_.PENDING, _.FAILURE, _.ROLLOUT_SUCCESS,
                        _.ROLLOUT_FAILURE],
                target=_.ROLLING_OUT,
                custom=dict(user_action=True, alias='rollout'))
    def rolling_out(self):
        pass

    @transition(source=[s for s in (_.FAILURE, _.ROLLOUT_FAILURE,
                                    _.ROLLOUT_BRAKED) if s in _all],
                target=_.ROLLING_OUT,
                custom=dict(user_action=True, alias='retry'))
    def rollout_retry(self):
        pass


class FortFSMixin(_FortBrakeFSMixin, _FSMixin):
    _brakes = _FortBrakeFSMixin._all
    _all = _brakes | _FSMixin._all | set([_.SMOKING,
                                          _.SMOKE_SUCCESS,
                                          _.SMOKE_FAILURE,
                                          _.BAKING,
                                          _.BAKE_SUCCESS,
                                          _.BAKE_FAILURE]
                                         )

    @transition(source=list(_all - _FSMixin._terminals),
                target=_.REVOKED,
                custom=dict(user_action=True, alias='revoke'))
    def revoked(self):
        pass

    @transition(source=list(_all - _brakes - _FSMixin._terminals),
                target=_.PENDING)
    def pending(self):
        pass

    @transition(source=[_.PENDING, _.BAKE_FAILURE],
                target=_.SMOKING,
                custom=dict(user_action=True, alias='smoke'))
    def smoking(self):
        pass

    @transition(source=_.SMOKE_SUCCESS,
                target=_.BAKING,
                custom=dict(user_action=True, alias='bake'))
    def baking(self):
        pass

    @transition(source=_.SMOKING,
                target=_.SMOKE_SUCCESS)
    def smoke_success(selF):
        pass

    @transition(source=_.BAKING,
                target=_.BAKE_SUCCESS)
    def bake_success(self):
        pass

    @transition(source=_.SMOKING,
                target=_.SMOKE_FAILURE)
    def smoke_failure(selF):
        pass

    @transition(source=_.BAKING,
                target=_.BAKE_FAILURE)
    def bake_failure(self):
        pass

    @transition(source=[s for s in (_.SMOKE_FAILURE, _.SMOKE_BRAKED)
                        if s in _all],
                target=_.SMOKING,
                custom=dict(user_action=True, alias='retry'))
    def smoke_retry(self):
        pass

    @transition(source=[s for s in (_.BAKE_FAILURE, _.BAKE_BRAKED)
                        if s in _all],
                target=_.BAKING,
                custom=dict(user_action=True, alias='retry'))
    def bake_retry(self):
        pass

    @transition(source=[_.BAKE_SUCCESS, _.FAILURE, _.ROLLOUT_SUCCESS],
                target=_.ROLLING_OUT,
                custom=dict(user_action=True, alias='rollout'))
    def rolling_out(self):
        pass
