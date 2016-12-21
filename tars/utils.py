""" Global Utilities """
from constance import config
from decisionTable import DecisionTable

from collections import OrderedDict
from copy import deepcopy

from django.db.models.base import ModelBase


def check_dict(dct, pattern=None):
    if isinstance(pattern, list):
        for rule in pattern:
            if check_dict(dct, rule):
                return True
    elif isinstance(pattern, tuple):
        if getattr(pattern[0], '__module__', None) == 'operator':
            opt, key, value = pattern
            return opt(value, dct.get(key))
        else:
            for rule in pattern:
                if not check_dict(dct, rule):
                    return False
            else:
                return True
    return False


class AdvancedPolymorph(object):
    """ use decision table to route specified class to achieve category """

    _decision_tables = {
        'deploy': {
            'instance': None, 'table_string': None,
            'result': ['deployment'], 'constance_key': 'DECISION_TABLE_DEPLOY'
        },
        'slb': {
            'instance': None, 'table_string': None,
            'result': ['slb'], 'constance_key': 'DECISION_TABLE_SLB'
        },
    }

    @classmethod
    def get_decision(cls, key, **kwargs):
        dt = cls._decision_tables[key]
        if dt['table_string'] != getattr(config, dt['constance_key']):
            dt['table_string'] = getattr(config, dt['constance_key'])
            dt['instance'] = DecisionTable(dt['table_string'])

        # filter non-defined kwarg if not in decision table header and
        # fill all defined kwarg whose None value with default value 'False'
        kwargs = OrderedDict(
            [(k, kwargs.get(k) or False)
             for k in dt['instance'].header if k not in dt['result']]
        )
        return dt['instance'].decision(result=dt['result'], **kwargs)



class InstanceProxyMetaclass(ModelBase):
    """ Intercept object creation, and check if need return a subclass instance
        This approach is safer but harms perfomance, since it triggers two __new__ __init__ process
        for all subclasses, comparing to replace __class__
    """
    def __call__(cls, *args, **kwargs):
        obj = super(InstanceProxyMetaclass, cls).__call__(*args, **kwargs)

        return obj.get_delegation(*args, **kwargs)

class InstanceScopePyringBean(object):
    """ Core of class swizzling in Python """
    __metaclass__ = InstanceProxyMetaclass

    def get_delegation(self, *args, **kwargs):
        raise NotImplementedError("You have to implement INSTANCE method get_delegation() for auto polymorph")

    @staticmethod
    def replace_class_delegation(obj, determined_cls, *args, **kwargs):
        """ helper for a common use case for get_delegation, just replace __class__ """
        # try to create a child instance causes fatal recursion,
        # workaround to replace object __class__ and do __init__ again
        if determined_cls != obj.__class__:
            obj.__class__ = obj.route_cls()
            obj.__init__(*args, **kwargs)  # this may cause multiple init in base class

        return obj


class ConstantSet(object):
    """ A kind of tree structure for a group of constants involving 'contains' relation,
        also can be used as Enum by checking contains().
        - Constructor args: a list of STRING constants or ConstantSet isinstance
        - You can pass a name to give set a name as access key, this is particular useful
        for sub set. Thus you can access particular constants by using set.name.constant
        or using set['name.constant']
        - Also you can use breath-first-search and depth-frist-search feature to implement
        more advanced feature
    """

    @property
    def consts(self):
        return [s for s in self._constants.values() if isinstance(s, basestring)]

    @property
    def sub_sets(self):
        """ return nested constant sets's name and content """
        return [c for c in self._constants.values() if isinstance(c, ConstantSet)]

    @property
    def parent(self):
        return self._parent

    def __init__(self, *args, **kwargs):
        self._constants = {}
        self._parent = None
        self._name = None

        for c in args:
            if isinstance(c, basestring):
                assert '.' not in c, "constant leaf node cannot contains '.'"
                self._constants[str(c)] = str(c)

            if isinstance(c, ConstantSet):
                c_copy = deepcopy(c)
                c_copy._parent = self
                sub_set_key = c_copy._name if hasattr(c_copy, '_name') else 'unname_set_%d' % hash(c_copy)
                self._constants[sub_set_key] = c_copy

        for k, v in kwargs.iteritems():
            if k.startswith('_'):
                setattr(self, k, v)
            elif isinstance(v, ConstantSet):
                # TODO: add const restriction on _parent or even all _vars
                v_copy = deepcopy(v)
                v_copy._parent = self
                v_copy._name = k
                self._constants[k] = v_copy
            elif isinstance(v, basestring):
                self._constants[k] = v

    def __iter__(self):
        """ depth first traverse all the elements in dict tree """
        if self._name:
            yield self._name

        for s in self.consts:
            yield s

        for sub_const_set in self.sub_sets:
            for n in iter(sub_const_set):
                yield n

    def __contains__(self, item):
        """ flaten values from all depth """
        if isinstance(item, basestring) and item in iter(self):
            return True
        else:
            return False

    def __getattr__(self, const_name):
        """ api to access key-value in shallow layer(tree depth 1) """
        if const_name == self._name:
            return self._name
        elif const_name in self._constants.keys():
            return self._constants.get(const_name)
        else:
            raise AttributeError("no bond const or attached property '%s'" % const_name)

    def __getitem__(self, path):
        # TODO: supported c[aaa.bbb] syntax
        raise NotImplementedError("TODO")
        for key in path:
            purified_key = key if '.' not in key else key[key.rfind('.') + 1:]

    def __str__(self):
        return str(self._name)

    def __repr__(self):
        template = "<{cls}>{{'keywords': {0} {1}}}"

        nested = ["'{0}': {1}".format(k, str(v))
            for k, v in self._constants.iteritems() if isinstance(v, ConstantSet)]

        if len(nested) > 0:
            nested = ', ' + ', '.join(nested)
        else:
            nested = ''

        return template.format(self.consts, nested, cls=type(self).__name__)

    def const_at_level(self, const_name, level):
        """ return a constant value in certain level of subsets, recursively, top-down """

        # check if const_name is in
        found_const = getattr(self, const_name) if const_name in self.consts else None

        found_sub_sets = filter(lambda sub: const_name in sub, self.sub_sets)

        if found_const:
            # since search from top to down, if we found const literal, no matter how much down
            # we drill, the constant value remains the same
            return found_const

        if found_sub_sets:
            if level <= 1:
                return str(found_sub_sets[0])
            else:
                return found_sub_sets[0].const_at_level(const_name, level - 1)


        return None


