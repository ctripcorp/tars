from ansible.playbook import PlayBook
from ansible.inventory import Inventory
from ansible.runner import Runner

from ansible import callbacks
from ansible import utils

from tempfile import NamedTemporaryFile
import os


ANSIBLE_PLAYBOOK_PATH = os.path.dirname(__file__)

class RunPlaybook():

    def __init__(self, user, logger, log_extra):
        self.user = user
        self.logger = logger
        self.log_extra = log_extra

    def run(self, hosts_file, command):
        utils.VERBOSITY = 0
        playbook_cb = callbacks.PlaybookCallbacks(verbose=utils.VERBOSITY)
        stats = callbacks.AggregateStats()
        runner_cb = callbacks.PlaybookRunnerCallbacks(stats, verbose=utils.VERBOSITY)
        try:
            hosts = NamedTemporaryFile(delete=False)
            hosts.write(hosts_file)
            hosts.close()
            playbook = PlayBook(
                playbook=os.path.join(ANSIBLE_PLAYBOOK_PATH, '{0}.yml'.format(command)),
                host_list=hosts.name,     # Our hosts, the rendered inventory file
                remote_user=self.user,
                callbacks=playbook_cb,
                runner_callbacks=runner_cb,
                stats=stats
            )
            results = playbook.run()
        finally:
            os.remove(hosts.name)
        return self.run_results(results)

    def assert_result(self, result):
        for key in ('failures', 'unreachable'):
            if result.get(key) != 0:
                return False

        return True

    def run_results(self, results):
        return all([self.assert_result(result) for result in results.values()])
