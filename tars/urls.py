from django.conf.urls import patterns, include, url
from django.contrib import admin
from django.views.generic import TemplateView, RedirectView


urlpatterns = patterns('',
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/v1/', include('tars.api.urls')),
    url(r'^(surface/)?', include("tars.surface.urls")),
    url(r'^domaininfo/', TemplateView.as_view(template_name='OnService.html')), # health check flag
    url(r'^favicon\.ico$', RedirectView.as_view(url='/static/logo.ico')),
    url(r'^login/$', 'tars.surface.views.login'),
    url(r'^logout/$', 'tars.surface.views.logout'),
)

# if settings.DEBUG:
#     additional_ones = patterns('',
#                                url(r'^docs/',
#                                    include('rest_framework_swagger.urls')),
#                                )
#     urlpatterns += additional_ones
#
