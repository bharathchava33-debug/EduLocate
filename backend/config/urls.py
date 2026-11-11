
from django.contrib import admin
from django.urls import path, include

from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [

    path("admin/", admin.site.urls),

    # User registration and login
    path("api/users/", include("users.urls")),

    # Cost Calculator and Cutoff Trends APIs
    path(
        "api/",
        include("institutions.cost_cutoff_urls")
    ),

    # Existing Institution APIs
    path("api/", include("institutions.urls")),
]


# Serve uploaded images during development
urlpatterns += static(
    settings.MEDIA_URL,
    document_root=settings.MEDIA_ROOT
)
