from django.contrib import admin

from tars.server import models


class GroupAdmin(admin.ModelAdmin):
    list_display = ('name',)
admin.site.register(models.Group, GroupAdmin)


class ServerAdmin(admin.ModelAdmin):
    list_display = ('hostname', 'ip_address')
admin.site.register(models.Server, ServerAdmin)


class JoinedGroupAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'app_id')
    search_fields = ('id', 'application__id')
    fields = ('aggregation', 'application')
    filter_horizontal = ('aggregation',)
    actions = ('drop_joined_group',)

    def app_id(self, obj):
        return obj.application_id

    def get_form(self, request, obj=None, **kwargs):
        """ hack to add filter to source of ModelMultipleChoiceField on field 'aggregation.choice' """
        form = super(JoinedGroupAdmin, self).get_form(request, obj, **kwargs)

        datasource = models.Group.objects.exclude(g_type=models.Group.G_TYPE_ENUM.join)

        if obj:
            datasource = datasource.filter(application_id=obj.application_id)

        # ModelChoiceIterator should be a tuple of prepared_val and lable
        new_choices = [(g.pk, "G<%s> A<%s> %s" % (g.pk, g.application_id, g.name)) for g in datasource]

        form.base_fields['aggregation'].choices = new_choices
        form.base_fields['aggregation'].required = False
        form.base_fields['application'].required = True

        return form

    def save_model(self, request, obj, form, change):
        obj.save()
        for g in form.cleaned_data['aggregation']:
            obj.join(g)

    def save_related(self, request, form, formsets, change):
        # pass, put save aggregation logic into save_model
        pass

    def drop_joined_group(self, request, selected_queryset):
        """ JoinedGroup.delete() is not same with Group.delete() """
        for joined_group in selected_queryset:
            models.Group.objects.get(pk=joined_group.pk).delete()

    def get_actions(self, request):
        actions = super(JoinedGroupAdmin, self).get_actions(request)
        del actions['delete_selected']
        return actions

# admin.site.register(models.JoinedGroup, JoinedGroupAdmin)

