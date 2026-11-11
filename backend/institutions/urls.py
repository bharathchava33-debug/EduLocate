from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    InstitutionViewSet,
    InstitutionImageViewSet,
    InterGroupViewSet,
    BranchViewSet,
    CourseOfferingViewSet,
    ProgramBranchViewSet,
    search_college,
    fetch_website_data,
    fetch_website_images,
    diploma_colleges,
)

router = DefaultRouter()

router.register(
    "institutions",
    InstitutionViewSet,
    basename="institution"
)

router.register(
    "institution-images",
    InstitutionImageViewSet,
    basename="institution-image"
)

router.register(
    "inter-groups",
    InterGroupViewSet,
    basename="inter-group"
)

router.register(
    "branches",
    BranchViewSet,
    basename="branch"
)

router.register(
    "courses",
    CourseOfferingViewSet,
    basename="course"
)

router.register(
    "program-branches",
    ProgramBranchViewSet,
    basename="program-branch"
)

urlpatterns = [
    path("", include(router.urls)),

    path(
        "fetch-college/",
        search_college,
        name="fetch-college"
    ),

    path(
        "fetch-website-data/",
        fetch_website_data,
        name="fetch-website-data"
    ),

    path(
        "fetch-website-images/",
        fetch_website_images,
        name="fetch-website-images"
    ),

    path(
        "diploma-colleges/",
        diploma_colleges,
        name="diploma-colleges"
    ),
]