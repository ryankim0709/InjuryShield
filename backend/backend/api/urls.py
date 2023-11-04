from django.urls import re_path as url
from django.views.generic.base import RedirectView

from backend.api.views import (
    projects,
    users,
)

app_name = 'api'

urlpatterns = [
    url(r'^projects$', projects.ProjectListView.as_view(), name='projects'),
    url(r'^projects/(?P<project_id>[\w-]+)$', projects.ProjectView.as_view(), name='project'),

    url(r'^trrecords$', projects.TRRecordListView.as_view(), name='tr_records_list'),
    url(r'^trrecords/(?P<record_id>[\w-]+)$', projects.TRRecordView.as_view(), name='tr_record'),

    url(r'^trinsights/summary$', projects.TRInsightSummaryView.as_view(), name='tr_insight_summary'), 
]
