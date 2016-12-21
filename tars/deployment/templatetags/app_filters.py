from decisionTable import DecisionTable
from django import template
from django.template.defaultfilters import stringfilter


register = template.Library()

DECISION_TABLE_TEMPLATE = '''
            <table cellspacing="0" id="result_list">
                <thead>
                <tr>
                {header}
                </tr>
                </thead>
                {decisions}
                </table>
'''

DT_INSTANCE = DecisionTable('=')


@register.filter
@stringfilter
def decision_table(value):
    header, decisions = DT_INSTANCE._DecisionTable__tableStringParser(value)
    header_str = '<th><div class="text">{name}</div></th>'

    header = [header_str.format(name=h) for h in header]
    decisions = ['<tr>'+''.join(['<td>{}</td>'.format(v) for v in d])+'</tr>'
                 for d in decisions]

    return DECISION_TABLE_TEMPLATE.format(
        header=''.join(header), decisions=''.join(decisions))
