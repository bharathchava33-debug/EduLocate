
from rest_framework import serializers
from .models import (
    Institution,
    Branch,
    CourseOffering,
    ProgramBranch,
    InterGroup,
    CutoffHistory,
)


class CalculatorInstitutionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Institution
        fields = [
            "id",
            "name",
            "education_level",
            "location",
            "district",
            "state",
            "class_fee",
            "hostel_fee",
            "hostel_facility",
        ]


class CostCalculationSerializer(serializers.Serializer):

    institution_id = serializers.IntegerField()

    program_branch_id = serializers.IntegerField(
        required=False,
        allow_null=True
    )

    course_offering_id = serializers.IntegerField(
        required=False,
        allow_null=True
    )

    inter_group_id = serializers.IntegerField(
        required=False,
        allow_null=True
    )

    transport_fee = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    books_fee = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    other_fee = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    years = serializers.IntegerField(
        min_value=1,
        max_value=10,
        default=1
    )

    def validate(self, attrs):

        try:
            institution = Institution.objects.get(
                id=attrs["institution_id"],
                approval_status="approved"
            )
        except Institution.DoesNotExist:
            raise serializers.ValidationError(
                {"institution_id": "Institution not found or not approved."}
            )

        attrs["institution"] = institution

        for field, model in [
            ("program_branch_id", ProgramBranch),
            ("course_offering_id", CourseOffering),
            ("inter_group_id", InterGroup),
        ]:
            object_id = attrs.get(field)

            if object_id:
                try:
                    obj = model.objects.get(
                        id=object_id,
                        institution=institution
                    )
                except model.DoesNotExist:
                    raise serializers.ValidationError({
                        field: "Selected option does not belong to this institution."
                    })

                attrs[field.replace("_id", "")] = obj

        for field in ["transport_fee", "books_fee", "other_fee"]:
            if attrs[field] < 0:
                raise serializers.ValidationError({
                    field: "Amount cannot be negative."
                })

        return attrs


class CutoffHistorySerializer(serializers.ModelSerializer):

    institution_name = serializers.CharField(
        source="institution.name",
        read_only=True
    )

    branch_name = serializers.CharField(
        source="branch.name",
        read_only=True
    )

    class Meta:
        model = CutoffHistory
        fields = [
            "id",
            "institution",
            "institution_name",
            "program_type",
            "course",
            "branch",
            "branch_name",
            "admission_year",
            "category",
            "measurement_type",
            "cutoff_value",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
