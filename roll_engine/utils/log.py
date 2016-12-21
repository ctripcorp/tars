from __future__ import absolute_import

import logging
import pytz
from datetime import datetime


class RollEngineFormatter(logging.Formatter):

    def format(self, record):
        if record.exc_info and not record.exc_text:
            # Cache the traceback text to avoid converting it multiple times
            # (it's constant anyway)
            record.exc_text = self.formatException(record.exc_info)

        cur_dt = datetime.fromtimestamp(record.created).isoformat()[:-3]+'Z'
        utc_dt = datetime.fromtimestamp(record.created, tz=pytz.utc)\
            .isoformat()[:-9]+'Z'

        log = {
            'log_level': record.levelname,
            'log_timestamp': cur_dt,
            'log_timestamp_utc': utc_dt,
            'detail': record.msg,
            'stacktrace': record.exc_text or '',
        }

        deploy = record.deploy
        tgt = getattr(record, 'tgt', None)
        operator = getattr(record, 'operator', None)
        log.update(deploy.build_deployment_log(tgt, operator=operator))
        return log


class _RollEngineHandler(logging.Handler):

    def emit(self, record):
        try:
            formatted_log = self.format(record)
            record.deploy.log_callback(formatted_log)
        except AttributeError:
            return
        except:
            self.handleError(record)


def get_logger(name='roll_engine'):
    root_logger = logging.getLogger(name)
    root_logger.setLevel(logging.INFO)
    if not any([isinstance(h, _RollEngineHandler)
                for h in root_logger.handlers]):
        root_logger.handlers = []
        _formatter = RollEngineFormatter()
        _handler = _RollEngineHandler()
        _handler.setFormatter(_formatter)
        _handler.setLevel(logging.INFO)
        root_logger.addHandler(_handler)
    return root_logger
