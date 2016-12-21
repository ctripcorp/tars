from __future__ import absolute_import

import re
import logging
import zlib
import json
import ast
try:
    from vcr.serializers import yamlserializer
except ImportError:
    yamlserializer = None

from .exceptions import ConfigItemMissing


logging.basicConfig()


class ConfigDict(dict):
    def __getitem__(self, key):
        v = dict.get(self, key)
        if v is None:
            raise ConfigItemMissing('setting of {} is required by {} client'
                                    .format(key, self.host.lower()))
        else:
            return v


def get_logger():
    return logging.getLogger('rest_client')


def underscore2camel(underscoreized_str):
    return re.sub(r"[a-z]_[a-z]", lambda x: x.group()[0] + x.group()[2].upper(),
                  underscoreized_str)


def camel2underscore(camelized_str):
    first_cap_re = re.compile('(.)([A-Z][a-z]+)')
    all_cap_re = re.compile('([a-z0-9])([A-Z])')

    s1 = first_cap_re.sub(r'\1_\2', camelized_str)
    return all_cap_re.sub(r'\1_\2', s1).lower()


def deflate(data, compresslevel=9):
    compress = zlib.compressobj(
        compresslevel,        # level: 0-9
        zlib.DEFLATED,        # method: must be DEFLATED
        16 + zlib.MAX_WBITS,  # window size in bits:
        #   -15..-8: negate, suppress header
        #   8..15: normal
        #   16..30: subtract 16, gzip header
        zlib.DEF_MEM_LEVEL,   # mem level: 1..8/9
        0                     # strategy:
        #   0 = Z_DEFAULT_STRATEGY
        #   1 = Z_FILTERED
        #   2 = Z_HUFFMAN_ONLY
        #   3 = Z_RLE
        #   4 = Z_FIXED
    )
    deflated = compress.compress(data)
    deflated += compress.flush()
    return deflated


def inflate(data):
    decompress = zlib.decompressobj(
        16 + zlib.MAX_WBITS  # see above
    )
    inflated = decompress.decompress(data)
    inflated += decompress.flush()
    return inflated


def slb_inflate(data):
    if yamlserializer is None:
        raise Exception("require vcrpy package")
    return json.loads(inflate(yamlserializer.deserialize(data)))


def slb_deflate(data):
    if yamlserializer is None:
        raise Exception("require vcrpy package")
    return yamlserializer.serialize(deflate(json.dumps(data)))


class Guardor(object):
    _hidden_keywords = r'TOKEN|PASS'
    _cleansed_title = r'********************'
    _sensive_regex = re.compile(_hidden_keywords, re.IGNORECASE)

    @staticmethod
    def _str2obj(raw_data):
        try:
            if isinstance(raw_data, basestring):
                obj = ast.literal_eval(raw_data)
            else:
                obj = raw_data
        except Exception:
            #maybe we should log sth.
            return raw_data

        if isinstance(obj, list):
            return map(Guardor._str2obj, obj)
        elif isinstance(obj, tuple):
            return tuple(map(Guardor._str2obj, obj))
        elif isinstance(obj, dict):
            return {k: Guardor._str2obj(v) for k, v in obj.items()}
        else:
            return obj

    @staticmethod
    def mask_sensive(raw_data):
        def _sensive2cleansed(key, value):
            try:
                if Guardor._sensive_regex.search(key):
                    cleansed = Guardor._cleansed_title
                else:
                    cleansed = value
            except TypeError:
                # If the key isn't regex-able, just return as-is.
                cleansed = value
            return cleansed

        if isinstance(raw_data, list):
            return map(Guardor.mask_sensive, raw_data)
        elif isinstance(raw_data, tuple):
            return tuple(map(Guardor.mask_sensive, raw_data))
        elif isinstance(raw_data, dict):
            return {k: Guardor.mask_sensive(_sensive2cleansed(k, v)) for k, v in raw_data.items()}
        else:
            return raw_data

    @staticmethod
    def cleanse_content(raw_data):
        data = Guardor._str2obj(raw_data)
        return Guardor.mask_sensive(data)
