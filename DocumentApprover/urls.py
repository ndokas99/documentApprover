from django.contrib import admin
from django.conf.urls.static import static
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("approver.urls")),
    re_path(r"^static/(?P<path>.*)$", serve, {'document_root': settings.STATIC_ROOT})
]
