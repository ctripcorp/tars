from django.contrib import admin

from tars.application import models


class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('name',)
admin.site.register(models.Application, ApplicationAdmin)


class PackageAdmin(admin.ModelAdmin):
    list_display = ('name', 'version', 'application')
admin.site.register(models.Package, PackageAdmin)
