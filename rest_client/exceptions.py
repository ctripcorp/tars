class RestClientError(Exception):
    pass


class ServerResponseException(RestClientError):
    """Server response error class for client."""


class InvalidRestMethodException(RestClientError):
    """A valid HTTP method is required to make a request."""


class ConfigMissing(RestClientError):
    pass


class ConfigItemMissing(RestClientError):
    pass


# SALT
class SaltClientError(ServerResponseException):
    pass


class SaltAuthenticationError(SaltClientError):
    """Salt Authentication Error."""


class SaltModuleUnavailableException(SaltClientError):
    """Salt Module Unavailable."""


# SLB
class SLBClientError(ServerResponseException):
    pass


class SLBInternalError(SLBClientError):
    pass


class SLB4SOAServiceNotFound(SLBClientError):
    pass

class RLBClientError(SLBClientError):
    pass

# KAFKA
class KAFKAClientError(ServerResponseException):
    pass


# CMS
class CMSClientError(ServerResponseException):
    pass


# ROLES
class RolesClientError(ServerResponseException):
    pass


# ES
class ESClientError(ServerResponseException):
    pass


# JobAgent
class JobAgentClientError(ServerResponseException):
    pass
