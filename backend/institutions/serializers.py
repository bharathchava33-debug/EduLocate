
from rest_framework import serializers

from .models import (
    Institution,
    InstitutionImage,
    InterGroup,
    Branch,
    CourseOffering,
    ProgramBranch,
)


def validate_non_negative(value, field_name):
    if value is not None and value < 0:
        raise serializers.ValidationError(
            f"{field_name} cannot be negative."
        )
    return value


# =========================================================
# INSTITUTION IMAGE
# =========================================================

class InstitutionImageSerializer(serializers.ModelSerializer):

    class Meta:
        model = InstitutionImage
        fields = [
            "id",
            "institution",
            "image",
            "image_url",
            "is_primary",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def validate(self, attrs):
        if self.instance:
            requested_institution = attrs.get(
                "institution",
                self.instance.institution
            )

            if requested_institution != self.instance.institution:
                raise serializers.ValidationError(
                    "An image cannot be moved to another institution."
                )

            image = attrs.get("image") or self.instance.image
            image_url = (
                attrs.get("image_url")
                or self.instance.image_url
            )
        else:
            image = attrs.get("image")
            image_url = attrs.get("image_url")

        if not image and not image_url:
            raise serializers.ValidationError(
                "Please provide an image file or image URL."
            )

        return attrs


# =========================================================
# INTER GROUP
# =========================================================

class InterGroupSerializer(serializers.ModelSerializer):

    class Meta:
        model = InterGroup
        fields = [
            "id",
            "institution",
            "group_name",
            "group_fee",
            "hostel_fee",
        ]
        read_only_fields = ["id"]

    def validate_group_fee(self, value):
        return validate_non_negative(value, "Group fee")

    def validate_hostel_fee(self, value):
        return validate_non_negative(value, "Hostel fee")

    def validate(self, attrs):
        if (
            self.instance
            and attrs.get("institution", self.instance.institution)
            != self.instance.institution
        ):
            raise serializers.ValidationError(
                "A group cannot be moved to another institution."
            )

        return attrs


# =========================================================
# BRANCH
# =========================================================

class BranchSerializer(serializers.ModelSerializer):

    class Meta:
        model = Branch
        fields = ["id", "name"]
        read_only_fields = ["id"]


# =========================================================
# PROGRAM BRANCH
# =========================================================

class ProgramBranchSerializer(serializers.ModelSerializer):

    branch_name = serializers.CharField(
        source="branch.name",
        read_only=True,
    )

    class Meta:
        model = ProgramBranch
        fields = [
            "id",
            "institution",
            "program_type",
            "course",
            "branch",
            "branch_name",
            "cutoff_from",
            "cutoff_to",
            "branch_fee",
        ]
        read_only_fields = ["id", "branch_name"]

    def validate_cutoff_from(self, value):
        return validate_non_negative(value, "Cutoff from")

    def validate_cutoff_to(self, value):
        return validate_non_negative(value, "Cutoff to")

    def validate_branch_fee(self, value):
        return validate_non_negative(value, "Branch fee")

    def validate(self, attrs):
        if (
            self.instance
            and attrs.get("institution", self.instance.institution)
            != self.instance.institution
        ):
            raise serializers.ValidationError(
                "A program branch cannot be moved to another institution."
            )

        cutoff_from = attrs.get(
            "cutoff_from",
            getattr(self.instance, "cutoff_from", None),
        )

        cutoff_to = attrs.get(
            "cutoff_to",
            getattr(self.instance, "cutoff_to", None),
        )

        if (
            cutoff_from is not None
            and cutoff_to is not None
            and cutoff_from > cutoff_to
        ):
            raise serializers.ValidationError({
                "cutoff_to": (
                    "Cutoff to must be greater than "
                    "or equal to cutoff from."
                )
            })

        return attrs


# =========================================================
# COURSE OFFERING
# =========================================================

class CourseOfferingSerializer(serializers.ModelSerializer):

    branches = BranchSerializer(
        many=True,
        read_only=True,
    )

    branch_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Branch.objects.all(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = CourseOffering
        fields = [
            "id",
            "institution",
            "course",
            "branches",
            "branch_ids",
            "course_fee",
        ]
        read_only_fields = ["id"]

    def validate_course_fee(self, value):
        return validate_non_negative(value, "Course fee")

    def validate(self, attrs):
        if (
            self.instance
            and attrs.get("institution", self.instance.institution)
            != self.instance.institution
        ):
            raise serializers.ValidationError(
                "A course cannot be moved to another institution."
            )

        return attrs

    def create(self, validated_data):
        branch_ids = validated_data.pop("branch_ids", [])
        course = CourseOffering.objects.create(**validated_data)
        course.branches.set(branch_ids)
        return course

    def update(self, instance, validated_data):
        branch_ids = validated_data.pop("branch_ids", None)

        for attribute, value in validated_data.items():
            setattr(instance, attribute, value)

        instance.save()

        if branch_ids is not None:
            instance.branches.set(branch_ids)

        return instance


# =========================================================
# INSTITUTION
# =========================================================

class InstitutionSerializer(serializers.ModelSerializer):

    images = InstitutionImageSerializer(
        many=True,
        read_only=True,
    )

    inter_groups = InterGroupSerializer(
        many=True,
        read_only=True,
    )

    courses = CourseOfferingSerializer(
        many=True,
        read_only=True,
    )

    program_branches = ProgramBranchSerializer(
        many=True,
        read_only=True,
    )

    created_by_username = serializers.CharField(
        source="created_by.username",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = Institution

        fields = [
            "id",
            "name",
            "created_by",
            "created_by_username",
            "approval_status",
            "education_level",
            "location",
            "district",
            "state",
            "google_place_id",
            "google_maps_url",
            "latitude",
            "longitude",
            "rating",
            "review_count",
            "phone",
            "email",
            "website",
            "description",
            "college_type",
            "autonomous",
            "institution_type",
            "affiliated_to",
            "approved_by",
            "bus_facility",
            "hostel_facility",
            "hostel_fee",
            "school_classes",
            "syllabus",
            "class_fee",
            "jee_main",
            "images",
            "inter_groups",
            "courses",
            "program_branches",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_by",
            "created_by_username",
            "approval_status",
            "created_at",
            "updated_at",
            "images",
            "inter_groups",
            "courses",
            "program_branches",
        ]

    def validate_latitude(self, value):
        if value is not None and not -90 <= value <= 90:
            raise serializers.ValidationError(
                "Latitude must be between -90 and 90."
            )
        return value

    def validate_longitude(self, value):
        if value is not None and not -180 <= value <= 180:
            raise serializers.ValidationError(
                "Longitude must be between -180 and 180."
            )
        return value

    def validate_rating(self, value):
        if value is not None and not 0 <= value <= 5:
            raise serializers.ValidationError(
                "Rating must be between 0 and 5."
            )
        return value

    def validate_hostel_fee(self, value):
        return validate_non_negative(value, "Hostel fee")

    def validate_class_fee(self, value):
        return validate_non_negative(value, "Class fee")

    def validate(self, attrs):
        hostel_facility = attrs.get(
            "hostel_facility",
            getattr(self.instance, "hostel_facility", False),
        )

        hostel_fee = attrs.get(
            "hostel_fee",
            getattr(self.instance, "hostel_fee", None),
        )

        if not hostel_facility:
            attrs["hostel_fee"] = None

        elif hostel_fee is not None and hostel_fee < 0:
            raise serializers.ValidationError({
                "hostel_fee": "Hostel fee cannot be negative."
            })

        return attrs
