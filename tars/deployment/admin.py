from decisionTable import DecisionTable

from constance.admin import ConstanceAdmin, ConstanceForm, Config
from constance import LazyConfig

from django.contrib import admin

from tars.deployment import models


config = LazyConfig()

class CustomConstanceForm(ConstanceForm):
    def clean(self):
        cleaned_data = super(CustomConstanceForm, self).clean()

        dt_keys = [k for k in cleaned_data.keys() if 'DECISION_TABLE' in k]
        # validate decision table string format
        try:
            for key in dt_keys:
                dt = DecisionTable(cleaned_data[key])
                if not dt.decisions:
                    self.add_error(key, 'The decisions in your input value is empty')
        except ValueError as e:
            self.add_error(key, e)


class ConfigAdmin(ConstanceAdmin):
    change_list_template = 'constance_change_list.html'
    change_list_form = CustomConstanceForm


admin.site.unregister([Config])
admin.site.register([Config], ConfigAdmin)
