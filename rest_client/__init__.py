from __future__ import absolute_import

import re
from rest_client.clients import (
    get_es_client,
    get_salt_client,
)

pattern = re.compile("^get_[a-z_]+_client$")

__all__ = tuple(i for i in globals().keys() if pattern.search(i) is not None)
