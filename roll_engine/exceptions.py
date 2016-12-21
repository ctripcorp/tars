class DeploymentError(Exception):
    pass


class BatchPatternError(DeploymentError):
    pass


class MetaMissing(DeploymentError):
    pass


class JobMissing(DeploymentError):
    pass


class StatusError(DeploymentError):
    pass


class ActionNotExist(DeploymentError):
    pass


class ActionNotAllowed(DeploymentError):
    pass


class ActionFailed(DeploymentError):
    pass
