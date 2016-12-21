from collections import namedtuple

from celery import shared_task

from roll_engine.utils.log import get_logger
from roll_engine.tasks import Tasks, on_error
from roll_engine.celery import app as celery_app
from rest_client import get_salt_client

from tars.deployment import constants
from tars.server.models import Server


es_logger = get_logger()

_Retriever = namedtuple('Retriever', 'deployment batch target')


class TarsTasks(Tasks):
    @classmethod
    def _retrieve_models(cls, deployment_id=None, batch_id=None,
                         target_id=None):
        """ workaround to get rid of circular import """
        from tars.deployment.models import (TarsDeployment, TarsDeploymentBatch,
                                            TarsDeploymentTarget)

        deployment = batch = target = None

        if target_id is not None:
            target = TarsDeploymentTarget.objects.get(id=target_id)
        if batch_id is not None:
            if target is not None:
                batch = target.batch
            else:
                batch = TarsDeploymentBatch.objects.get(id=batch_id)
        if deployment_id is not None:
            if batch is not None:
                deployment = batch.deployment
            elif target is not None:
                deployment = target.batch.deployment
            else:
                deployment = TarsDeployment.objects.get(id=deployment_id)

        return _Retriever(deployment=deployment, batch=batch, target=target)

    @classmethod
    @shared_task
    def ping(cls, profile, hostname):
        try:
            salt = get_salt_client(profile)
            return salt.run_module_await(hostname, 'test.ping', wait_timeout=15)
        except Exception as e:
            return {'result': str(e)}

    @classmethod
    @shared_task(ignore_result=True)
    @on_error
    def purge_queue(task_id):
        res = celery_app.AsyncResult(task_id)
        for k, v in res.collect(intermediate=True, timeout=3):
            pass

    @classmethod
    @shared_task
    @on_error
    def download(cls, deploy_id, tgt_id, operator=None):
        deploy, _, tgt = cls._retrieve_models(deployment_id=deploy_id,
                                              target_id=tgt_id)
        extra = {'deploy': deploy, 'tgt': tgt, 'operator': operator}

        if not tgt.safe_trans(constants.DOWNLOADING):
            return

        es_logger.info('Will download package', extra=extra)
        result, description = tgt.download_package()

        if result:
            tgt.trans(constants.DOWNLOAD_SUCCESS)
            es_logger.info('Download success', extra=extra)
        else:
            tgt.trans(constants.DOWNLOAD_FAILURE)
            es_logger.error('Download fail because: {0}'.format(description),
                            extra=extra)

    @classmethod
    @shared_task
    @on_error
    def install(cls, deploy_id, tgt_id, operator=None):
        deploy, _, tgt = cls._retrieve_models(deployment_id=deploy_id,
                                              target_id=tgt_id)
        extra = {'deploy': deploy, 'tgt': tgt, 'operator': operator}

        if not tgt.safe_trans(constants.INSTALLING):
            return

        es_logger.info('Will install the application', extra=extra)
        result, description = tgt.install_app()

        if result:
            tgt.trans(constants.INSTALL_SUCCESS)
            es_logger.info('Install application success', extra=extra)
        else:
            tgt.trans(constants.INSTALL_FAILURE)
            if description:
                es_logger.error("Install failed because: {0}"
                                .format(description), extra=extra)
            else:
                es_logger.error("Install failed, view agent log for detail",
                                extra=extra)

    @classmethod
    @shared_task
    @on_error
    def skip(cls, deploy_id, tgt_id, operator=None):
        deploy, _, tgt = cls._retrieve_models(deployment_id=deploy_id,
                                              target_id=tgt_id)
        extra = {'deploy': deploy, 'tgt': tgt, 'operator': operator}

        # if the target is a new added one or an already successful one
        # we do not check the skip logic
        if not tgt.safe_trans(constants.SKIPPING):
            return

        result, description = tgt.skip()

        if result:
            tgt.trans(constants.VERIFY_SUCCESS)
            es_logger.warning('Skip %s, target %d' % (tgt, tgt.id), extra=extra)
        else:
            tgt.trans(constants.PENDING)

    @classmethod
    @shared_task
    @on_error
    def verify(cls, deploy_id, tgt_id, operator):
        deploy, _, tgt = cls._retrieve_models(deployment_id=deploy_id,
                                              target_id=tgt_id)
        extra = {'deploy': deploy, 'tgt': tgt, 'operator': operator}

        if not tgt.safe_trans(constants.VERIFYING):
            return

        es_logger.info('Will verify the installation', extra=extra)
        result, description = tgt.verify_app()
        ignore_verify_result = deploy.config.ignore_verify_result

        if ignore_verify_result or result:
            tgt.trans(constants.VERIFY_SUCCESS)
            es_logger.info('Verify installation success', extra=extra)
        else:
            tgt.trans(constants.VERIFY_FAILURE)
            if description:
                es_logger.error("Verify fail because: {0}".format(description),
                                extra=extra)
            else:
                es_logger.error("Verify failed, view agent log for detail",
                                extra=extra)

    @classmethod
    def rollout_job(cls):
        return (
            cls.start_rolling_target,
            cls.skip,
            cls.pull_out,
            cls.download,
            cls.install,
            cls.verify,
            cls.pull_in,
            cls.finish_rolling_target,
        )

    @classmethod
    def smoke_job(cls):
        return (
            cls.start_rolling_target,
            cls.pull_out,
            cls.download,
            cls.install,
            cls.verify,
        )

    @classmethod
    def bake_job(cls):
        return (
            cls.pull_in,
            cls.finish_rolling_target,
        )

