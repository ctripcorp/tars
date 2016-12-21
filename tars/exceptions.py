class TarsError(Exception):
    pass


class SyncError(TarsError):
    pass


class PackageError(TarsError):
    pass
