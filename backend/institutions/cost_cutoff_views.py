
from decimal import Decimal

from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser

from .models import (
    Institution,
    ProgramBranch,
    CourseOffering,
    InterGroup,
    CutoffHistory,
)

from .cost_cutoff_serializers import (
    CalculatorInstitutionSerializer,
    CostCalculationSerializer,
    CutoffHistorySerializer,
)


class CalculatorInstitutionListView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):

        institutions = Institution.objects.filter(
            approval_status="approved"
        ).order_by("name")

        level = request.query_params.get("education_level")

        if level:
            institutions = institutions.filter(
                education_level=level
            )

        serializer = CalculatorInstitutionSerializer(
            institutions,
            many=True
        )

        return Response(serializer.data)


class CostCalculationView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = CostCalculationSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        institution = data["institution"]

        tuition_fee = Decimal("0")
        hostel_fee = Decimal("0")
        fee_source = "Not configured"

        # School fee
        if institution.education_level == "school":

            tuition_fee = institution.class_fee or Decimal("0")
            fee_source = "School class fee"

        # Intermediate college fee
        elif institution.education_level == "inter_college":

            group = data.get("inter_group")

            if group:
                tuition_fee = group.group_fee or Decimal("0")
                hostel_fee = group.hostel_fee or Decimal("0")
                fee_source = group.group_name

            else:
                tuition_fee = Decimal("0")

        # Diploma / Engineering / Degree
        else:

            program = data.get("program_branch")
            course = data.get("course_offering")

            if program:
                tuition_fee = program.branch_fee or Decimal("0")
                fee_source = program.branch.name

            elif course:
                tuition_fee = course.course_fee or Decimal("0")
                fee_source = course.course

        # Institution hostel fee is used when group hostel fee
        # has not been provided.
        if hostel_fee == 0:
            hostel_fee = institution.hostel_fee or Decimal("0")

        transport_fee = data["transport_fee"]
        books_fee = data["books_fee"]
        other_fee = data["other_fee"]
        years = data["years"]

        annual_total = (
            tuition_fee
            + hostel_fee
            + transport_fee
            + books_fee
            + other_fee
        )

        course_total = annual_total * years

        return Response({
            "institution": institution.name,
            "education_level": institution.education_level,
            "fee_source": fee_source,
            "years": years,
            "breakdown": {
                "tuition_fee": tuition_fee,
                "hostel_fee": hostel_fee,
                "transport_fee": transport_fee,
                "books_fee": books_fee,
                "other_fee": other_fee,
            },
            "annual_total": annual_total,
            "course_total": course_total,
            "currency": "INR",
        })


class CalculatorInstitutionOptionsView(APIView):

    permission_classes = [AllowAny]

    def get(self, request, institution_id):

        institution = get_object_or_404(
            Institution,
            id=institution_id,
            approval_status="approved"
        )

        courses = CourseOffering.objects.filter(
            institution=institution
        ).prefetch_related("branches")

        program_branches = ProgramBranch.objects.filter(
            institution=institution
        ).select_related("branch")

        groups = InterGroup.objects.filter(
            institution=institution
        )

        return Response({
            "id": institution.id,
            "name": institution.name,
            "education_level": institution.education_level,

            "courses": [
                {
                    "id": item.id,
                    "course": item.course,
                    "course_fee": item.course_fee,
                }
                for item in courses
            ],

            "program_branches": [
                {
                    "id": item.id,
                    "branch_name": item.branch.name,
                    "program_type": item.program_type,
                    "branch_fee": item.branch_fee,
                    "cutoff_from": item.cutoff_from,
                    "cutoff_to": item.cutoff_to,
                }
                for item in program_branches
            ],

            "inter_groups": [
                {
                    "id": item.id,
                    "group_name": item.group_name,
                    "group_fee": item.group_fee,
                    "hostel_fee": item.hostel_fee,
                }
                for item in groups
            ],
        })


class CutoffTrendsView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):

        records = CutoffHistory.objects.select_related(
            "institution",
            "branch"
        ).all()

        institution_id = request.query_params.get("institution_id")
        program_type = request.query_params.get("program_type")
        branch_id = request.query_params.get("branch_id")
        category = request.query_params.get("category")
        measurement = request.query_params.get("measurement_type")

        if institution_id:
            records = records.filter(
                institution_id=institution_id
            )

        if program_type:
            records = records.filter(
                program_type=program_type
            )

        if branch_id:
            records = records.filter(
                branch_id=branch_id
            )

        if category:
            records = records.filter(
                category__iexact=category
            )

        if measurement:
            records = records.filter(
                measurement_type=measurement
            )

        serializer = CutoffHistorySerializer(
            records,
            many=True
        )

        return Response(serializer.data)


class CutoffHistoryCreateView(APIView):

    permission_classes = [IsAdminUser]

    def post(self, request):

        serializer = CutoffHistorySerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )
