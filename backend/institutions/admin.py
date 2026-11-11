
from django.contrib import admin
from .models import (
    Institution,
    InstitutionImage,
    InterGroup,
    Branch,
    CourseOffering,
    ProgramBranch,
)

from .models import CutoffHistory

@admin.register(CutoffHistory)
class CutoffHistoryAdmin(admin.ModelAdmin):

    list_display = (
        "institution",
        "program_type",
        "branch",
        "admission_year",
        "category",
        "measurement_type",
        "cutoff_value",
    )

    list_filter = (
        "program_type",
        "admission_year",
        "category",
        "measurement_type",
    )

    search_fields = (
        "institution__name",
        "branch__name",
        "category",
    )

class InstitutionImageInline(admin.TabularInline):
    model = InstitutionImage
    extra = 1


class InterGroupInline(admin.TabularInline):
    model = InterGroup
    extra = 1


class CourseOfferingInline(admin.TabularInline):
    model = CourseOffering
    extra = 1
    filter_horizontal = ("branches",)


class ProgramBranchInline(admin.TabularInline):
    model = ProgramBranch
    extra = 1


@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "education_level",
        "district",
        "state",
        "college_type",
        "rating",
    )

    list_filter = (
        "education_level",
        "college_type",
        "institution_type",
        "state",
        "district",
    )

    search_fields = (
        "name",
        "location",
        "district",
        "state",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    inlines = [
        InstitutionImageInline,
        InterGroupInline,
        CourseOfferingInline,
        ProgramBranchInline,
    ]

    fieldsets = (
        ("Basic Information", {
            "fields": (
                "name",
                "education_level",
                "created_by",
                "location",
                "district",
                "state",
                "phone",
                "email",
                "website",
                "description",
            )
        }),
        ("Google Maps Information", {
            "fields": (
                "google_place_id",
                "google_maps_url",
                "latitude",
                "longitude",
                "rating",
                "review_count",
            )
        }),
        ("College Information", {
            "fields": (
                "college_type",
                "autonomous",
                "institution_type",
                "affiliated_to",
                "approved_by",
            )
        }),
        ("Facilities", {
            "fields": (
                "bus_facility",
                "hostel_facility",
                "hostel_fee",
            )
        }),
        ("School Information", {
            "fields": (
                "school_classes",
                "syllabus",
                "class_fee",
            )
        }),
        ("Inter Information", {
            "fields": ("jee_main",)
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at")
        }),
    )


@admin.register(InstitutionImage)
class InstitutionImageAdmin(admin.ModelAdmin):
    list_display = (
        "institution",
        "is_primary",
        "created_at",
    )
    list_filter = ("is_primary",)
    search_fields = ("institution__name",)


@admin.register(InterGroup)
class InterGroupAdmin(admin.ModelAdmin):
    list_display = (
        "institution",
        "group_name",
        "group_fee",
        "hostel_fee",
    )
    search_fields = ("institution__name", "group_name")


@admin.register(Branch)
class BranchAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(CourseOffering)
class CourseOfferingAdmin(admin.ModelAdmin):
    list_display = (
        "institution",
        "course",
        "course_fee",
    )
    search_fields = ("institution__name", "course")
    filter_horizontal = ("branches",)


@admin.register(ProgramBranch)
class ProgramBranchAdmin(admin.ModelAdmin):
    list_display = (
        "institution",
        "program_type",
        "course",
        "branch",
        "cutoff_from",
        "cutoff_to",
        "branch_fee",
    )
    list_filter = ("program_type",)
    search_fields = (
        "institution__name",
        "course",
        "branch__name",
    )
