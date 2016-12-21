from roll_engine.fsm import TargetFSMixin, transition
from roll_engine import constants as _
from tars.deployment import constants


class TarsTargetFSMixin(TargetFSMixin):
    _all = TargetFSMixin._all | set([constants.SKIPPING,
                                     constants.DOWNLOADING,
                                     constants.DOWNLOAD_SUCCESS,
                                     constants.DOWNLOAD_FAILURE,
                                     constants.INSTALLING,
                                     constants.INSTALL_SUCCESS,
                                     constants.INSTALL_FAILURE,
                                     constants.VERIFYING,
                                     constants.VERIFY_SUCCESS,
                                     constants.VERIFY_FAILURE]
                                    )

    @transition(source=list(_all - set([_.PENDING, _.SUCCESS, _.REVOKED])),
                target=_.PENDING)
    def pending(self):
        pass

    @transition(source=constants.PENDING,
                target=constants.SKIPPING)
    def skipping(self):
        pass

    @transition(source=_.DISABLE_SUCCESS,
                target=constants.DOWNLOADING)
    def downloading(self):
        pass

    @transition(source=constants.DOWNLOAD_SUCCESS,
                target=constants.INSTALLING)
    def installing(self):
        pass

    @transition(source=constants.INSTALL_SUCCESS,
                target=constants.VERIFYING)
    def verifying(self):
        pass

    @transition(source=[constants.VERIFY_SUCCESS, _.ENABLE_FAILURE],
                target=_.ENABLING)
    def enabling(self):
        pass

    @transition(source=constants.DOWNLOADING,
                target=constants.DOWNLOAD_SUCCESS)
    def download_success(self):
        pass

    @transition(source=constants.INSTALLING,
                target=constants.INSTALL_SUCCESS)
    def install_success(self):
        pass

    @transition(source=[constants.VERIFYING, constants.SKIPPING],
                target=constants.VERIFY_SUCCESS)
    def verify_success(self):
        pass

    @transition(source=[_.ENABLE_SUCCESS, constants.VERIFY_SUCCESS],
                target=_.SUCCESS)
    def success(self):
        pass

    @transition(source=constants.DOWNLOADING,
                target=constants.DOWNLOAD_FAILURE)
    def download_failure(self):
        pass

    @transition(source=constants.INSTALLING,
                target=constants.INSTALL_FAILURE)
    def install_failure(self):
        pass

    @transition(source=constants.VERIFYING,
                target=constants.VERIFY_FAILURE)
    def verify_failure(self):
        pass
