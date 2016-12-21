""" LbFacade represents a binding of slb_client onto a specified group """

import logging
from constance import config

from tars.utils import AdvancedPolymorph


logger = logging.getLogger(__name__)


def choose_lb_facade(group, extra_hints=None):

    # Global disable lb operation
    if config.EXTERNAL_SLB is False:
        LbFacadeCls = FakedSlbFacade

    # use constance.SLB_DECISION_TABLE to determine which LB should be used
    else:
        clues = dict(g_type=group.g_type)

        clues = {tag: True for tag in group.application.tags}

        if extra_hints:
            clues.update(**extra_hints)

        lb_literal = AdvancedPolymorph.get_decision('slb', **clues)
        LbFacadeCls = globals().get(lb_literal)

    assert issubclass(LbFacadeCls, BaseLbFacade) or issubclass(LbFacadeCls, BaseAggregateLb), \
        "cannot find impl class for slb category '%s'" % lb_literal

    return LbFacadeCls


class BaseLbFacade(object):

    client = None
    enable_flag_key = None

    def __init__(self, group):
        self.group = group

        assert self.enable_flag_key, "You need to specify config.xxx as LB enable flag in admin"

        # when facade disable in config, swizzle with fake class
        enable_flag = getattr(config, self.enable_flag_key, None)
        if enable_flag is False:
            self.__class__ = FakedSlbFacade

    def __str__(self):
        return "%s<%s>" % (self.__class__, self.group.id)

    def pull_in(self, ip):
        raise NotImplementedError()

    def pull_out(self, ip):
        raise NotImplementedError()

    def pulled_servers(self):
        raise NotImplementedError()

    def query_status(self):
        raise NotImplementedError()

    def summarized_group_server_statuses(self):
        raise NotImplementedError()


class FakedSlbFacade(BaseLbFacade):

    def __init__(self, group):
        """ override base, bypass parameter check, cuz we dont need any of them """
        self.group = group

    def pull_in(self, ip):
        return True

    def pull_out(self, ip):
        return True

    def pulled_servers(self):
        return []

    def query_status(self):
        return []

    def summarized_group_server_statuses(self):
        all_ip_in_group = list(self.group.servers.values_list("ip_address", flat=True))

        return {
            'member': {True: all_ip_in_group, False: []},
            'server': {True: all_ip_in_group, False: []},
            'pull': {True: all_ip_in_group, False: []},
            'up': {True: all_ip_in_group, False: []}
        }


######################## composite facade or LB ##########################

class AggregateLbError(Exception):
    def __init__(self, reason, group, sub_lb, *args):
        msg = "AggregateLbError Error for {}, sub lb: {}, args: {}, reason: {}".format(
            group, sub_lb, args, reason
        )
        super(AggregateLbError, self).__init__(msg)


class BaseAggregateLb(object):
    """ aggregated interface and dispatcher for JoinedGroup slb operation,
        which barely relays on client and enable_flag_key
    """

    def __init__(self, group):
        self.group = group
        self.facades = []  # facades need to be called in each func

    def _aggregate_call(self, func, *fixed_args_for_inner_func):
        """ generic, high order wrapper to apply a given func on all groups around then gather result,
            given func must take 'group' as the first parameter
        """
        results = []

        # TODO: parallelise func call, maybe greenlet/coroutine?
        for fa in self.facades:
            try:
                single_result = func(fa, *fixed_args_for_inner_func)
                results.append(single_result)
            except Exception, e:
                raise AggregateLbError(e.message, self.group.id, fa, fixed_args_for_inner_func)

        return results

    def pull_in(self, ip):
        f = lambda facade, ip: facade.pull_in(ip)
        return all(self._aggregate_call(f, ip))

    def pull_out(self, ip):
        f = lambda facade, ip: facade.pull_out(ip)
        reverse_f = lambda facade, ip: facade.pull_in(ip)
        try:
            return all(self._aggregate_call(f, ip))
        except AggregateLbError as e:
            logger.error(e.message)
            self._aggregate_call(reverse_f, ip)
            raise e

    def query_status(self):
        raise NotImplementedError()

    def pulled_servers(self):
        """ return upped servers for all groups, aggregate ip status entries from per group perspective"""
        f_query_status = lambda fa: fa.query_status()
        g_status_list = self._aggregate_call(f_query_status)

        f_check_up = lambda per_server: all([per_server.get(flag, True) for flag in ('member', 'server', 'pull')])

        # some ip may be up in group A but down in group B, so only calculate up server will leads to a false
        # positive result, we can do a set disjunction to resolve this.
        false_up_set, down_set = set(), set()

        for g_status in g_status_list:
            false_up_set.update([s['ip'] for s in g_status if f_check_up(s)])
            down_set.update([s['ip'] for s in g_status if not f_check_up(s)])

        return false_up_set - down_set

    def summarized_group_server_statuses(self):
        f_map_summary = lambda fa: fa.summarized_group_server_statuses()

        g_summarize_collection = self._aggregate_call(f_map_summary)

        def f_reduce_summary(acc, per_summary):
            # aggregate redundent info across all groups
            for section in ('member', 'server', 'up', 'pull'):
                for flag in (True, False):
                    acc[section][flag] += per_summary[section][flag]
            return acc

        try:
            initial = g_summarize_collection.pop()
            summary = reduce(f_reduce_summary, g_summarize_collection, initial)
        except KeyError as e:
            raise AggregateLbError("status query returns incomplete json structure", self.group.id, None)

        # kickout servers whose status is partially up
        for section_title in ('member', 'server', 'up', 'pull'):
            section = summary[section_title]
            section[False] = set(section[False])
            section[True] = list(set(section[True]) - section[False])
            section[False] = list(section[False])

        return summary


class JoinedGroupSlbFacade(BaseAggregateLb):
    """ aggregate a bunch of group """

    def __init__(self, group):
        super(JoinedGroupSlbFacade, self).__init__(group)
        self.facades = [g.get_lb() for g in self.group.aggregation.all()]
        self.cached_ips = self.group.servers.values_list("ip_address", flat=True)

    def _high_order_pull(self, g_pull_func_name, ip_or_ips):
        """  call pull_in/out on each sub group when it contains this ip """

        # unification
        ips = [ip_or_ips] if isinstance(ip_or_ips, basestring) else ip_or_ips

        # check if request ips not in JoinedGroup.servers
        if not (set(ips) <= set(self.cached_ips)):
            raise AggregateLbError("some servers does not belongs to this group", self.group.id, None, ips)


        def __helper_f_pull_each(facade, pulling_ips):
            per_group_ips = facade.group.servers.values_list("ip_address", flat=True)
            related_ips = [ip for ip in pulling_ips if ip in per_group_ips]

            f_pull_func = getattr(facade, g_pull_func_name)

            if related_ips:
                return f_pull_func(related_ips)
            else:
                return True

        results = self._aggregate_call(__helper_f_pull_each, ips)

        return all(results)

    def pull_in(self, ip):
        return self._high_order_pull('pull_in', ip)

    def pull_out(self, ip):
        return self._high_order_pull('pull_out', ip)

