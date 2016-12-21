from django.conf.urls import patterns, url

from tars.surface import views


urlpatterns = patterns('',
                       url(r'^$', views.index, name='surface_index'),
                       url(r'^ping/$', views.ping, name='surface_ping'),
                       url(r'^settings/$', views.export_settings,
                           name='settings'),
                       )
