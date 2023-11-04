"""
URL configuration for wolf project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include
from django.urls import re_path as url
from django.views.generic.base import RedirectView

from wolf import views
from wolf import admin

urlpatterns = [
    url(r'^__ht/', include('health_check.urls')),
    url(r'^manifest.json$', views.AppManifest.as_view()),

    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^admin$', RedirectView.as_view(url='/admin/')), 
    url(r'^admin/', include((admin.site.urls[0], admin.site.urls[1]), admin.site.urls[2])), 
    url(r'^hijack/', include('hijack.urls', namespace='hijack')),

    # login / signin
    url(r'^sign-in/?$', views.SigninView.as_view(), name='signin'),
    url(r'^sign-up/?$', views.SignupView.as_view(), name='signup'),
    url(r'^sign-out/?$', views.SignoutView.as_view(), name='signout'),
    url(r'^', include('django.contrib.auth.urls')), 
    url(r'^/?$', views.AppRedirectView.as_view()),

    # url(r'^signin_sso$', views.SigninSSOView.as_view(), name='sso'),
    url(r'^authentication/', include('wolf.signin_sso.urls', namespace='signin_sso')),

    # react app entry point
    url(r'^dashboard/([\w-]+)(/.*)?$', views.AppView.as_view(), name='dashboard'),
    url(r'^dashboard/?$', views.AppView.as_view(), name='home'),

    # api 
    url(r'^api/', include('wolf.api.urls', namespace='api')),
]
