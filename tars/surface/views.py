import json
import os
from collections import OrderedDict

from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseRedirect
from django.template import RequestContext
from django.template.response import TemplateResponse
from django.shortcuts import render_to_response
from django.views.debug import get_safe_settings
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login as auth_login, logout as auth_logout
from django.views.decorators.csrf import csrf_protect

from tars.server.models import Server
from tars.deployment.tasks import TarsTasks
from tars.surface.decorators import login_required
from rest_client import get_salt_client


@login_required
def index(request):
    settings = {}
    with open(os.path.dirname(__file__) + "/static/pom.json", 'r') as f:
        settings = json.load(f)

    return render_to_response('index.html',
                              settings,
                              RequestContext(request))


def ping(request):
    result = {"result": "Not executed!"}
    timeout = request.GET.get('timeout', 32)

    try:
        hostname = request.GET['server']
        server = Server.objects.filter(hostname=hostname).first()
        if server:
            ping_task = TarsTasks.ping
            salt_profile = server.group.application.salt_client
            result = ping_task.s(TarsTasks, salt_profile, hostname)\
                .delay().get(timeout=timeout)
            return HttpResponse(json.dumps(result))
        else:
            return HttpResponseBadRequest(
                'Server {} not found in TARS'.format(hostname))
    except KeyError as e:
        return HttpResponseBadRequest('missing {} in query params'.format(e))
    except Exception as e:
        return HttpResponseBadRequest(e)

def export_settings(request):
    settings = OrderedDict(
        sorted(get_safe_settings().items(), key=lambda s: s[0]))
    return render_to_response('settings.html', {'settings': settings})

@csrf_protect
def login(request):
    """ simple login view, always redirect to surface root """
    redirect_to = "/surface/"
    template_name = "surface_login.html"

    if request.method == "POST":
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            auth_login(request, form.get_user())

            return HttpResponseRedirect(redirect_to)
    else:
        form = AuthenticationForm(request)

    context = {
        'form': form,
        'next': redirect_to,
    }

    return TemplateResponse(request, template_name, context)

def logout(request):
    auth_logout(request)
    return HttpResponseRedirect("/surface/")

