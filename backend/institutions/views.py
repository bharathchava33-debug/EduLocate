
import json
import re
import socket
import ipaddress
import math

from decimal import Decimal, InvalidOperation
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

from django.conf import settings
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db import transaction, IntegrityError
from django.db.models import Q

from rest_framework import status, viewsets
from rest_framework.decorators import (
    api_view,
    permission_classes,
    action,
)
from rest_framework.permissions import (
    BasePermission,
    SAFE_METHODS,
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from .models import (
    Institution,
    InstitutionImage,
    InterGroup,
    Branch,
    CourseOffering,
    ProgramBranch,
)

from .serializers import (
    InstitutionSerializer,
    InstitutionImageSerializer,
    InterGroupSerializer,
    BranchSerializer,
    CourseOfferingSerializer,
    ProgramBranchSerializer,
)


# ============================================================
# COMMON HELPERS
# ============================================================

def get_json_data(request, key, default=None):
    value = request.data.get(key, default)

    if value is None:
        return default

    if isinstance(value, str):
        try:
            return json.loads(value)
        except (ValueError, TypeError):
            raise ValueError(f"Invalid JSON data for {key}.")

    return value


def get_bool(value, default=False):
    if value is None:
        return default

    if isinstance(value, bool):
        return value

    return str(value).lower() in ["true", "1", "yes", "on"]


def get_decimal(value, default=None):
    if value in [None, ""]:
        return default

    try:
        result = Decimal(str(value))

        if not result.is_finite():
            raise InvalidOperation

        return result

    except (InvalidOperation, ValueError, TypeError):
        raise ValueError(f"Invalid numeric value: {value}")


def get_integer(value, default=0):
    if value in [None, ""]:
        return default

    try:
        result = int(value)

        if result < 0:
            raise ValueError

        return result

    except (ValueError, TypeError):
        raise ValueError(f"Invalid integer value: {value}")


def valid_http_url(url):
    if not isinstance(url, str) or not url.strip():
        return False

    try:
        parsed = urlparse(url.strip())

        return (
            parsed.scheme in ["http", "https"]
            and bool(parsed.hostname)
            and not parsed.username
            and not parsed.password
        )

    except Exception:
        return False


def clean_text(value):
    if not value:
        return ""

    return re.sub(r"\s+", " ", str(value)).strip()


def validate_non_negative(value, field_name):
    if value is not None and value < 0:
        raise ValueError(f"{field_name} cannot be negative.")

    return value


def validate_required_text(value, field_name):
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{field_name} is required.")

    return value.strip()


# ============================================================
# DISTANCE CALCULATION
# ============================================================

def calculate_distance_km(lat1, lon1, lat2, lon2):
    earth_radius = 6371.0

    lat1 = math.radians(float(lat1))
    lon1 = math.radians(float(lon1))
    lat2 = math.radians(float(lat2))
    lon2 = math.radians(float(lon2))

    latitude_difference = lat2 - lat1
    longitude_difference = lon2 - lon1

    a = (
        math.sin(latitude_difference / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(longitude_difference / 2) ** 2
    )

    a = max(0.0, min(1.0, a))

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a)
    )

    return round(earth_radius * c, 2)


# ============================================================
# USER ROLE HELPERS
# ============================================================

def get_user_role_and_approval(user):
    if not user or not user.is_authenticated:
        return None, False

    try:
        profile = user.profile

        return (
            profile.role,
            profile.approval_status == "approved"
        )

    except Exception:
        return None, False


def is_admin_user(user):
    if not user or not user.is_authenticated:
        return False

    if user.is_superuser:
        return True

    role, approved = get_user_role_and_approval(user)

    return role == "admin" and approved


def is_approved_authority(user):
    if not user or not user.is_authenticated:
        return False

    role, approved = get_user_role_and_approval(user)

    return role == "authority" and approved


def can_manage_institution(user, institution):
    if is_admin_user(user):
        return True

    if is_approved_authority(user):
        return institution.created_by_id == user.id

    return False


# ============================================================
# PERMISSIONS
# ============================================================

class InstitutionPermission(BasePermission):

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return (
            is_admin_user(request.user)
            or is_approved_authority(request.user)
        )

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        return can_manage_institution(
            request.user,
            obj
        )


class RelatedInstitutionPermission(BasePermission):

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return (
            is_admin_user(request.user)
            or is_approved_authority(request.user)
        )

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True

        institution = getattr(obj, "institution", None)

        if institution is None:
            return False

        return can_manage_institution(
            request.user,
            institution
        )


class AdminOnlyMutationPermission(BasePermission):

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return is_admin_user(request.user)


class CanManageInstitutionsPermission(BasePermission):

    def has_permission(self, request, view):
        return (
            is_admin_user(request.user)
            or is_approved_authority(request.user)
        )


# ============================================================
# SAFE EXTERNAL URL VALIDATION
# ============================================================

def is_public_hostname(hostname):
    if not hostname:
        return False

    try:
        addresses = socket.getaddrinfo(
            hostname,
            None,
            proto=socket.IPPROTO_TCP
        )

        if not addresses:
            return False

        for result in addresses:
            ip = ipaddress.ip_address(result[4][0])

            if not ip.is_global:
                return False

        return True

    except Exception:
        return False


def safe_external_url(url):
    if not valid_http_url(url):
        return False

    parsed = urlparse(url)

    return is_public_hostname(parsed.hostname)


# ============================================================
# GOOGLE PLACES API
# ============================================================

GOOGLE_PLACES_SEARCH_URL = (
    "https://places.googleapis.com/v1/places:searchText"
)

GOOGLE_PLACES_FIELD_MASK = ",".join([
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.addressComponents",
    "places.nationalPhoneNumber",
    "places.websiteUri",
    "places.location",
    "places.rating",
    "places.userRatingCount",
    "places.googleMapsUri",
])


def get_google_address_component(components, component_type):
    for component in components:
        if component_type in component.get("types", []):
            return (
                component.get("longText")
                or component.get("shortText")
                or ""
            )

    return ""


# ============================================================
# SEARCH COLLEGE USING GOOGLE PLACES
# ============================================================

@api_view(["POST"])
@permission_classes([CanManageInstitutionsPermission])
def search_college(request):

    college_name = request.data.get("name", "")

    if not isinstance(college_name, str) or not college_name.strip():
        return Response(
            {"error": "Please enter a valid college name."},
            status=status.HTTP_400_BAD_REQUEST
        )

    api_key = getattr(
        settings,
        "GOOGLE_PLACES_API_KEY",
        ""
    )

    if not api_key:
        return Response(
            {"error": "GOOGLE_PLACES_API_KEY is not configured."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": GOOGLE_PLACES_FIELD_MASK,
    }

    payload = {
        "textQuery": college_name.strip(),
        "languageCode": "en",
        "regionCode": "IN",
        "pageSize": 5,
    }

    try:
        response = requests.post(
            GOOGLE_PLACES_SEARCH_URL,
            headers=headers,
            json=payload,
            timeout=20
        )

        if response.status_code != 200:

            try:
                error_data = response.json().get("error", {})
                error_message = error_data.get(
                    "message",
                    "Google Places search failed."
                )
                error_status = error_data.get(
                    "status",
                    "UNKNOWN_ERROR"
                )

            except ValueError:
                error_message = response.text[:500]
                error_status = "UNKNOWN_ERROR"

            return Response(
                {
                    "error": error_message,
                    "google_status": error_status,
                    "http_status": response.status_code,
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        google_data = response.json()

    except requests.exceptions.Timeout:
        return Response(
            {"error": "Google Places request timed out."},
            status=status.HTTP_504_GATEWAY_TIMEOUT
        )

    except requests.exceptions.RequestException:
        return Response(
            {"error": "Unable to connect to Google Places API."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    except ValueError:
        return Response(
            {"error": "Invalid response from Google Places."},
            status=status.HTTP_502_BAD_GATEWAY
        )

    colleges = []

    for place in google_data.get("places", []):

        display_name = place.get("displayName", {})
        address_components = place.get("addressComponents", [])
        location_data = place.get("location", {})

        district = (
            get_google_address_component(
                address_components,
                "administrative_area_level_2"
            )
            or get_google_address_component(
                address_components,
                "administrative_area_level_3"
            )
        )

        state_name = get_google_address_component(
            address_components,
            "administrative_area_level_1"
        )

        website = place.get("websiteUri", "")

        if website and not valid_http_url(website):
            website = ""

        colleges.append({
            "google_place_id": place.get("id", ""),
            "name": display_name.get(
                "text",
                college_name.strip()
            ),
            "location": place.get("formattedAddress", ""),
            "district": district,
            "state": state_name,
            "phone": place.get("nationalPhoneNumber", ""),
            "website": website,
            "latitude": location_data.get("latitude"),
            "longitude": location_data.get("longitude"),
            "rating": place.get("rating"),
            "review_count": place.get("userRatingCount", 0),
            "google_maps_url": place.get("googleMapsUri", ""),
            "photos": [],
        })

    result = {
        "message": "Google Places search completed.",
        "results": colleges,
        "count": len(colleges),
    }

    if colleges:
        result.update(colleges[0])

    return Response(
        result,
        status=status.HTTP_200_OK
    )


# ============================================================
# WEBSITE EXTRACTION
# ============================================================

def extract_srcset_url(srcset):
    if not srcset:
        return ""

    return srcset.split(",")[0].strip().split(" ")[0]


def extract_academic_data(soup, website_url):

    page_text = clean_text(
        soup.get_text(" ", strip=True)
    )

    academic_data = {
        "courses": [],
        "branches": [],
        "cutoffs": [],
        "fees": [],
    }

    course_keywords = [
        "B.Tech", "B.E", "M.Tech", "M.E", "MBA",
        "MCA", "BCA", "B.Sc", "M.Sc", "B.Com",
        "B.A", "Diploma", "Intermediate", "Polytechnic",
    ]

    branch_keywords = [
        "Computer Science and Engineering",
        "Computer Science", "CSE",
        "Electronics and Communication Engineering",
        "ECE",
        "Electrical and Electronics Engineering",
        "EEE",
        "Mechanical Engineering", "MECH",
        "Civil Engineering", "CIVIL",
        "Information Technology", "IT",
        "Artificial Intelligence", "AI",
        "Data Science", "Cyber Security",
    ]

    lower_text = page_text.lower()

    for course in course_keywords:
        if course.lower() in lower_text:
            academic_data["courses"].append(course)

    for branch in branch_keywords:
        if branch.lower() in lower_text:
            academic_data["branches"].append(branch)

    for line in soup.stripped_strings:

        line = clean_text(line)

        if not line:
            continue

        lower_line = line.lower()

        if "cutoff" in lower_line or "cut-off" in lower_line:
            academic_data["cutoffs"].append(line[:300])

        if "fee" in lower_line or "fees" in lower_line:
            academic_data["fees"].append(line[:300])

    academic_data["cutoffs"] = academic_data["cutoffs"][:20]
    academic_data["fees"] = academic_data["fees"][:20]

    return academic_data


def extract_website_images(soup, final_url):

    image_urls = []

    og_image = soup.find(
        "meta",
        property="og:image"
    )

    if og_image and og_image.get("content"):
        image_urls.append(
            urljoin(final_url, og_image.get("content"))
        )

    twitter_image = soup.find(
        "meta",
        attrs={"name": "twitter:image"}
    )

    if twitter_image and twitter_image.get("content"):
        image_urls.append(
            urljoin(final_url, twitter_image.get("content"))
        )

    image_link = soup.find(
        "link",
        rel=lambda value: value and "image_src" in value
    )

    if image_link and image_link.get("href"):
        image_urls.append(
            urljoin(final_url, image_link.get("href"))
        )

    for img in soup.find_all("img"):

        sources = [
            img.get("src"),
            img.get("data-src"),
            img.get("data-lazy-src"),
            img.get("data-original"),
            img.get("data-image"),
            extract_srcset_url(img.get("srcset")),
        ]

        for source in sources:

            if not source:
                continue

            full_url = urljoin(
                final_url,
                source.strip()
            )

            if valid_http_url(full_url):
                image_urls.append(full_url)

    unique_images = []

    for image_url in image_urls:

        if (
            valid_http_url(image_url)
            and image_url not in unique_images
        ):
            unique_images.append(image_url)

        if len(unique_images) >= 40:
            break

    return unique_images


# ============================================================
# SAFE WEBSITE FETCH
# ============================================================

REDIRECT_STATUS_CODES = {301, 302, 303, 307, 308}


def fetch_official_html(website_url):

    current_url = website_url

    headers = {
        "User-Agent": "Mozilla/5.0 EduLocate/1.0",
        "Accept": "text/html,application/xhtml+xml",
    }

    for attempt in range(6):

        if not safe_external_url(current_url):
            return None, None, Response(
                {"error": "Invalid or unsafe website URL."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            response = requests.get(
                current_url,
                headers=headers,
                timeout=15,
                allow_redirects=False,
                stream=True
            )

        except requests.RequestException:
            return None, None, Response(
                {"error": "Unable to access the official website."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if response.status_code in REDIRECT_STATUS_CODES:

            location = response.headers.get("Location")
            response.close()

            if not location:
                return None, None, Response(
                    {"error": "Invalid website redirect."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            current_url = urljoin(
                current_url,
                location
            )

            continue

        if response.status_code != 200:

            response.close()

            return None, None, Response(
                {
                    "error": (
                        f"Website returned HTTP "
                        f"{response.status_code}."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        content_type = response.headers.get(
            "Content-Type",
            ""
        )

        if "text/html" not in content_type.lower():

            response.close()

            return None, None, Response(
                {"error": "The URL does not return an HTML page."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            content = response.raw.read(
                3 * 1024 * 1024 + 1
            )

        except Exception:

            response.close()

            return None, None, Response(
                {"error": "Unable to read website content."},
                status=status.HTTP_400_BAD_REQUEST
            )

        response.close()

        if len(content) > 3 * 1024 * 1024:
            return None, None, Response(
                {"error": "Website page is too large."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return content, current_url, None

    return None, None, Response(
        {"error": "Too many website redirects."},
        status=status.HTTP_400_BAD_REQUEST
    )


# ============================================================
# FETCH WEBSITE DATA
# ============================================================

@api_view(["POST"])
@permission_classes([CanManageInstitutionsPermission])
def fetch_website_data(request):

    website_url = request.data.get("url", "")

    if not valid_http_url(website_url):
        return Response(
            {"error": "Please provide a valid website URL."},
            status=status.HTTP_400_BAD_REQUEST
        )

    html_content, final_url, error_response = fetch_official_html(
        website_url.strip()
    )

    if error_response:
        return error_response

    soup = BeautifulSoup(
        html_content,
        "html.parser"
    )

    images = extract_website_images(
        soup,
        final_url
    )

    academic_data = extract_academic_data(
        soup,
        final_url
    )

    title = (
        clean_text(soup.title.get_text())
        if soup.title else ""
    )

    description = ""

    description_tag = soup.find(
        "meta",
        attrs={"name": "description"}
    )

    if description_tag:
        description = description_tag.get("content", "")

    return Response({
        "message": "Website data fetched successfully.",
        "website": final_url,
        "title": title,
        "description": description,
        "images": images,
        "academic_data": academic_data,
    })


# ============================================================
# FETCH WEBSITE IMAGES
# ============================================================

@api_view(["POST"])
@permission_classes([CanManageInstitutionsPermission])
def fetch_website_images(request):

    website_url = request.data.get("url", "")

    if not valid_http_url(website_url):
        return Response(
            {"error": "Please provide a valid website URL."},
            status=status.HTTP_400_BAD_REQUEST
        )

    html_content, final_url, error_response = fetch_official_html(
        website_url.strip()
    )

    if error_response:
        return error_response

    soup = BeautifulSoup(
        html_content,
        "html.parser"
    )

    images = extract_website_images(
        soup,
        final_url
    )

    return Response({
        "message": "Website images fetched successfully.",
        "website": final_url,
        "images": images,
        "count": len(images),
    })


# ============================================================
# INSTITUTION CRUD AND APPROVAL WORKFLOW
# ============================================================

class InstitutionViewSet(viewsets.ModelViewSet):

    queryset = Institution.objects.all().select_related(
        "created_by"
    ).prefetch_related(
        "images",
        "inter_groups",
        "courses__branches",
        "program_branches__branch",
    )

    serializer_class = InstitutionSerializer
    permission_classes = [InstitutionPermission]

    # --------------------------------------------------------
    # FILTER INSTITUTIONS BY USER ROLE
    # --------------------------------------------------------

    def get_queryset(self):

        user = self.request.user

        if is_admin_user(user):
            return self.queryset

        if is_approved_authority(user):
            return self.queryset.filter(
                created_by=user
            )

        return self.queryset.filter(
            approval_status=Institution.ApprovalStatus.APPROVED
        )

    # --------------------------------------------------------
    # AI ADVISOR INSTITUTION SEARCH
    # GET /api/institutions/advisor-search/
    # --------------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        url_path="advisor-search"
    )
    def advisor_search(self, request):

        institutions = self.get_queryset()

        education_level = request.query_params.get(
            "education_level"
        )

        location = request.query_params.get(
            "location"
        )

        syllabus = request.query_params.get(
            "syllabus"
        )

        branch = request.query_params.get(
            "branch"
        )

        group = request.query_params.get(
            "group"
        )

        college_type = request.query_params.get(
            "college_type"
        )

        max_fee = request.query_params.get(
            "max_fee"
        )

        min_rating = request.query_params.get(
            "min_rating"
        )

        valid_levels = [
            "school",
            "inter_college",
            "diploma",
            "engineering",
            "degree",
        ]

        if education_level:
            if education_level not in valid_levels:
                return Response(
                    {"error": "Invalid education level."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            institutions = institutions.filter(
                education_level=education_level
            )

        # Location search
        if location:
            institutions = institutions.filter(
                Q(location__icontains=location)
                | Q(district__icontains=location)
                | Q(state__icontains=location)
            )

        # School syllabus
        if syllabus:
            institutions = institutions.filter(
                syllabus__icontains=syllabus
            )

        # College type
        if college_type:
            if college_type not in [
                "government",
                "aided",
                "private",
            ]:
                return Response(
                    {"error": "Invalid college type."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            institutions = institutions.filter(
                college_type=college_type
            )

        # Branch search
        if branch:
            institutions = institutions.filter(
                program_branches__branch__name__icontains=branch
            )

        # Intermediate group search
        if group:
            institutions = institutions.filter(
                inter_groups__group_name__icontains=group
            )

        # Rating filter
        if min_rating:

            try:
                rating_value = Decimal(min_rating)

                if (
                    not rating_value.is_finite()
                    or not Decimal("0") <= rating_value <= Decimal("5")
                ):
                    raise ValueError

            except (InvalidOperation, ValueError):
                return Response(
                    {"error": "Minimum rating must be between 0 and 5."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            institutions = institutions.filter(
                rating__gte=rating_value
            )

        # Maximum fee filter
        if max_fee:

            try:
                fee_value = Decimal(max_fee)

                if not fee_value.is_finite() or fee_value < 0:
                    raise ValueError

            except (InvalidOperation, ValueError):
                return Response(
                    {"error": "Please provide a valid maximum fee."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if education_level == "school":

                institutions = institutions.filter(
                    class_fee__isnull=False,
                    class_fee__lte=fee_value
                )

            elif education_level == "inter_college":

                institutions = institutions.filter(
                    inter_groups__group_fee__isnull=False,
                    inter_groups__group_fee__lte=fee_value
                )

            elif education_level in [
                "diploma",
                "engineering",
                "degree",
            ]:

                institutions = institutions.filter(
                    Q(
                        program_branches__branch_fee__isnull=False,
                        program_branches__branch_fee__lte=fee_value
                    )
                    | Q(
                        courses__course_fee__isnull=False,
                        courses__course_fee__lte=fee_value
                    )
                )

            else:
                return Response(
                    {
                        "error": (
                            "Select an education level before "
                            "applying a maximum fee."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        institutions = institutions.distinct().order_by(
            "-rating",
            "-review_count",
            "name"
        )

        serializer = self.get_serializer(
            institutions,
            many=True
        )

        return Response(
            {
                "count": institutions.count(),
                "filters": {
                    "education_level": education_level,
                    "location": location,
                    "syllabus": syllabus,
                    "branch": branch,
                    "group": group,
                    "college_type": college_type,
                    "max_fee": max_fee,
                    "min_rating": min_rating,
                },
                "results": serializer.data,
            },
            status=status.HTTP_200_OK
        )

    # --------------------------------------------------------
    # NEARBY INSTITUTIONS
    # --------------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        url_path="nearby"
    )
    def nearby(self, request):

        try:
            latitude = Decimal(
                request.query_params.get("latitude", "")
            )

            longitude = Decimal(
                request.query_params.get("longitude", "")
            )

            if (
                not latitude.is_finite()
                or not longitude.is_finite()
            ):
                raise ValueError

            if not Decimal("-90") <= latitude <= Decimal("90"):
                raise ValueError

            if not Decimal("-180") <= longitude <= Decimal("180"):
                raise ValueError

        except (InvalidOperation, ValueError, TypeError):

            return Response(
                {
                    "error": (
                        "Please provide valid latitude "
                        "and longitude."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        radius_value = request.query_params.get("radius")

        try:
            radius = (
                float(radius_value)
                if radius_value not in [None, ""]
                else None
            )

            if radius is not None and (
                not math.isfinite(radius)
                or radius <= 0
            ):
                raise ValueError

        except (ValueError, TypeError):

            return Response(
                {"error": "Radius must be a positive number."},
                status=status.HTTP_400_BAD_REQUEST
            )

        institutions = self.get_queryset().filter(
            latitude__isnull=False,
            longitude__isnull=False
        )

        education_level = request.query_params.get(
            "education_level"
        )

        if education_level:

            valid_levels = [
                "school",
                "inter_college",
                "diploma",
                "engineering",
                "degree",
            ]

            if education_level not in valid_levels:
                return Response(
                    {"error": "Invalid education level."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            institutions = institutions.filter(
                education_level=education_level
            )

        results = []

        for institution in institutions:

            distance = calculate_distance_km(
                latitude,
                longitude,
                institution.latitude,
                institution.longitude
            )

            if radius is not None and distance > radius:
                continue

            serializer = self.get_serializer(institution)

            institution_data = dict(serializer.data)

            institution_data["distance"] = distance
            institution_data["distance_unit"] = "km"

            results.append(institution_data)

        results.sort(
            key=lambda item: item["distance"]
        )

        return Response(
            {
                "count": len(results),
                "student_location": {
                    "latitude": float(latitude),
                    "longitude": float(longitude),
                },
                "results": results,
            },
            status=status.HTTP_200_OK
        )

    # --------------------------------------------------------
    # LOCATION SUGGESTIONS
    # --------------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        url_path="location-suggestions"
    )
    def location_suggestions(self, request):

        query = request.query_params.get(
            "q",
            ""
        ).strip()

        if len(query) < 2:
            return Response(
                {"error": "Enter at least 2 characters."},
                status=status.HTTP_400_BAD_REQUEST
            )

        api_key = getattr(
            settings,
            "GOOGLE_PLACES_API_KEY",
            ""
        )

        if not api_key:
            return Response(
                {
                    "error": (
                        "GOOGLE_PLACES_API_KEY "
                        "is not configured."
                    )
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": (
                "places.id,"
                "places.displayName,"
                "places.formattedAddress,"
                "places.location,"
                "places.addressComponents"
            ),
        }

        payload = {
            "textQuery": query,
            "languageCode": "en",
            "regionCode": "IN",
            "pageSize": 5,
        }

        try:

            response = requests.post(
                GOOGLE_PLACES_SEARCH_URL,
                headers=headers,
                json=payload,
                timeout=20
            )

            if response.status_code != 200:

                try:
                    google_error = response.json().get(
                        "error",
                        {}
                    )

                    error_message = google_error.get(
                        "message",
                        "Google Places API request failed."
                    )

                    error_status = google_error.get(
                        "status",
                        "UNKNOWN_ERROR"
                    )

                except ValueError:

                    error_message = response.text[:500]
                    error_status = "UNKNOWN_ERROR"

                return Response(
                    {
                        "error": error_message,
                        "google_status": error_status,
                        "http_status": response.status_code,
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

            google_data = response.json()

        except requests.exceptions.Timeout:

            return Response(
                {"error": "Google Places request timed out."},
                status=status.HTTP_504_GATEWAY_TIMEOUT
            )

        except requests.exceptions.RequestException:

            return Response(
                {
                    "error": (
                        "Unable to connect to Google Places API."
                    )
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        except ValueError:

            return Response(
                {"error": "Invalid response from Google Places."},
                status=status.HTTP_502_BAD_GATEWAY
            )

        locations = []

        for place in google_data.get("places", []):

            location_data = place.get(
                "location",
                {}
            )

            latitude = location_data.get("latitude")
            longitude = location_data.get("longitude")

            if latitude is None or longitude is None:
                continue

            components = place.get(
                "addressComponents",
                []
            )

            district = (
                get_google_address_component(
                    components,
                    "administrative_area_level_2"
                )
                or get_google_address_component(
                    components,
                    "administrative_area_level_3"
                )
            )

            state_name = get_google_address_component(
                components,
                "administrative_area_level_1"
            )

            locations.append({
                "place_id": place.get("id"),
                "name": place.get(
                    "displayName",
                    {}
                ).get("text", ""),
                "address": place.get(
                    "formattedAddress",
                    ""
                ),
                "latitude": latitude,
                "longitude": longitude,
                "district": district,
                "state": state_name,
            })

        return Response(
            {
                "message": "Location search completed.",
                "count": len(locations),
                "results": locations,
            },
            status=status.HTTP_200_OK
        )

    # --------------------------------------------------------
    # PENDING INSTITUTIONS
    # --------------------------------------------------------

    @action(
        detail=False,
        methods=["get"],
        url_path="pending",
        permission_classes=[IsAuthenticated],
    )
    def pending(self, request):

        if not is_admin_user(request.user):
            return Response(
                {
                    "error": (
                        "Only Admin can view pending institutions."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        institutions = self.queryset.filter(
            approval_status=Institution.ApprovalStatus.PENDING
        )

        serializer = self.get_serializer(
            institutions,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # --------------------------------------------------------
    # APPROVE INSTITUTION
    # --------------------------------------------------------

    @action(
        detail=True,
        methods=["post"],
        url_path="approve",
        permission_classes=[IsAuthenticated],
    )
    def approve(self, request, pk=None):

        if not is_admin_user(request.user):
            return Response(
                {"error": "Only Admin can approve institutions."},
                status=status.HTTP_403_FORBIDDEN
            )

        institution = self.get_object()

        institution.approval_status = (
            Institution.ApprovalStatus.APPROVED
        )

        institution.save(
            update_fields=["approval_status"]
        )

        return Response(
            {
                "message": "Institution approved successfully.",
                "institution_id": institution.id,
                "name": institution.name,
                "approval_status": institution.approval_status,
            },
            status=status.HTTP_200_OK
        )

    # --------------------------------------------------------
    # REJECT INSTITUTION
    # --------------------------------------------------------

    @action(
        detail=True,
        methods=["post"],
        url_path="reject",
        permission_classes=[IsAuthenticated],
    )
    def reject(self, request, pk=None):

        if not is_admin_user(request.user):
            return Response(
                {"error": "Only Admin can reject institutions."},
                status=status.HTTP_403_FORBIDDEN
            )

        institution = self.get_object()

        institution.approval_status = (
            Institution.ApprovalStatus.REJECTED
        )

        institution.save(
            update_fields=["approval_status"]
        )

        return Response(
            {
                "message": "Institution rejected successfully.",
                "institution_id": institution.id,
                "name": institution.name,
                "approval_status": institution.approval_status,
            },
            status=status.HTTP_200_OK
        )

    # --------------------------------------------------------
    # CREATE INSTITUTION
    # ADMIN = APPROVED
    # AUTHORITY = PENDING
    # --------------------------------------------------------

    @transaction.atomic
    def create(self, request, *args, **kwargs):

        if not (
            is_admin_user(request.user)
            or is_approved_authority(request.user)
        ):
            raise PermissionDenied(
                "You do not have permission to add institutions."
            )

        data = request.data

        try:

            name = validate_required_text(
                data.get("name"),
                "Institution name"
            )

            education_level = data.get("education_level")

            valid_levels = [
                "school",
                "inter_college",
                "diploma",
                "engineering",
                "degree",
            ]

            if education_level not in valid_levels:
                raise ValueError(
                    "Please select a valid education level."
                )

            college_type = data.get("college_type") or None

            valid_college_types = [
                "government",
                "aided",
                "private",
            ]

            if (
                college_type
                and college_type not in valid_college_types
            ):
                raise ValueError("Invalid college type.")

            institution_type = (
                data.get("institution_type") or None
            )

            valid_institution_types = [
                "autonomous",
                "jntu",
                "university",
                "deemed_university",
                "other",
            ]

            if (
                institution_type
                and institution_type not in valid_institution_types
            ):
                raise ValueError("Invalid institution type.")

            latitude = get_decimal(data.get("latitude"))
            longitude = get_decimal(data.get("longitude"))
            rating = get_decimal(data.get("rating"))
            hostel_fee = get_decimal(data.get("hostel_fee"))
            class_fee = get_decimal(data.get("class_fee"))

            validate_non_negative(hostel_fee, "Hostel fee")
            validate_non_negative(class_fee, "Class fee")

            if (
                latitude is not None
                and not Decimal("-90") <= latitude <= Decimal("90")
            ):
                raise ValueError(
                    "Latitude must be between -90 and 90."
                )

            if (
                longitude is not None
                and not Decimal("-180") <= longitude <= Decimal("180")
            ):
                raise ValueError(
                    "Longitude must be between -180 and 180."
                )

            if (
                rating is not None
                and not Decimal("0") <= rating <= Decimal("5")
            ):
                raise ValueError(
                    "Rating must be between 0 and 5."
                )

            if (
                not get_bool(data.get("hostel_facility"))
                and hostel_fee is not None
            ):
                raise ValueError(
                    "Hostel fee should be empty when hostel "
                    "facility is unavailable."
                )

            review_count = get_integer(
                data.get("review_count"),
                0
            )

            website = data.get("website") or ""

            if website and not valid_http_url(website):
                raise ValueError(
                    "Please enter a valid website URL."
                )

            google_maps_url = (
                data.get("google_maps_url") or ""
            )

            if (
                google_maps_url
                and not valid_http_url(google_maps_url)
            ):
                raise ValueError(
                    "Please enter a valid Google Maps URL."
                )

            email = data.get("email") or ""

            if email:
                try:
                    validate_email(email)
                except ValidationError:
                    raise ValueError(
                        "Please enter a valid email address."
                    )

            google_place_id = (
                data.get("google_place_id") or None
            )

            if (
                google_place_id
                and Institution.objects.filter(
                    google_place_id=google_place_id
                ).exists()
            ):
                raise ValueError(
                    "This institution already exists using "
                    "this Google Place ID."
                )

            approval_status = (
                Institution.ApprovalStatus.APPROVED
                if is_admin_user(request.user)
                else Institution.ApprovalStatus.PENDING
            )

            institution = Institution.objects.create(
                name=name,
                created_by=request.user,
                approval_status=approval_status,
                education_level=education_level,
                location=data.get("location", ""),
                district=data.get("district", ""),
                state=data.get("state", ""),
                google_place_id=google_place_id,
                google_maps_url=google_maps_url or None,
                latitude=latitude,
                longitude=longitude,
                rating=rating,
                review_count=review_count,
                phone=data.get("phone", ""),
                email=email or None,
                website=website,
                description=data.get("description", ""),
                college_type=college_type,
                autonomous=get_bool(data.get("autonomous")),
                institution_type=institution_type,
                affiliated_to=data.get("affiliated_to", ""),
                approved_by=data.get("approved_by", ""),
                bus_facility=get_bool(data.get("bus_facility")),
                hostel_facility=get_bool(data.get("hostel_facility")),
                hostel_fee=hostel_fee,
                school_classes=data.get("school_classes", ""),
                syllabus=data.get("syllabus", ""),
                class_fee=class_fee,
                jee_main=get_bool(data.get("jee_main")),
            )

            # INTER GROUPS

            inter_groups = get_json_data(
                request,
                "inter_groups",
                []
            )

            if not isinstance(inter_groups, list):
                raise ValueError(
                    "Inter groups must be a list."
                )

            for group in inter_groups:

                if not isinstance(group, dict):
                    raise ValueError(
                        "Invalid inter group data."
                    )

                group_name = validate_required_text(
                    group.get("group_name"),
                    "Group name"
                )

                group_fee = get_decimal(
                    group.get("group_fee")
                )

                group_hostel_fee = get_decimal(
                    group.get("hostel_fee")
                )

                validate_non_negative(
                    group_fee,
                    "Group fee"
                )

                validate_non_negative(
                    group_hostel_fee,
                    "Group hostel fee"
                )

                InterGroup.objects.create(
                    institution=institution,
                    group_name=group_name,
                    group_fee=group_fee,
                    hostel_fee=group_hostel_fee,
                )

            # COURSES AND BRANCHES

            courses = get_json_data(
                request,
                "courses",
                []
            )

            if not isinstance(courses, list):
                raise ValueError("Courses must be a list.")

            for course_data in courses:

                if not isinstance(course_data, dict):
                    raise ValueError("Invalid course data.")

                course_name = validate_required_text(
                    course_data.get("course"),
                    "Course name"
                )

                course_fee = get_decimal(
                    course_data.get("course_fee")
                )

                validate_non_negative(
                    course_fee,
                    "Course fee"
                )

                course = CourseOffering.objects.create(
                    institution=institution,
                    course=course_name,
                    course_fee=course_fee,
                )

                branches = course_data.get(
                    "branches",
                    []
                )

                if not isinstance(branches, list):
                    raise ValueError(
                        "Course branches must be a list."
                    )

                for branch_value in branches:

                    if isinstance(branch_value, dict):
                        branch_name = branch_value.get(
                            "name",
                            ""
                        )
                    else:
                        branch_name = branch_value

                    branch_name = validate_required_text(
                        branch_name,
                        "Branch name"
                    )

                    branch, _ = Branch.objects.get_or_create(
                        name=branch_name
                    )

                    course.branches.add(branch)

            # PROGRAM BRANCHES AND CUTOFFS

            program_branches = get_json_data(
                request,
                "program_branches",
                []
            )

            if not program_branches:
                program_branches = get_json_data(
                    request,
                    "diploma_branches",
                    []
                )

            if not isinstance(program_branches, list):
                raise ValueError(
                    "Program branches must be a list."
                )

            for program_data in program_branches:

                if not isinstance(program_data, dict):
                    raise ValueError(
                        "Invalid program branch data."
                    )

                program_type = program_data.get(
                    "program_type",
                    ""
                )

                if program_type not in [
                    "diploma",
                    "engineering",
                    "degree",
                ]:
                    raise ValueError(
                        "Invalid program type."
                    )

                branch_name = (
                    program_data.get("branch")
                    or program_data.get("branch_name")
                    or ""
                )

                branch_name = validate_required_text(
                    branch_name,
                    "Branch name"
                )

                course_name = (
                    program_data.get("course") or ""
                )

                if not isinstance(course_name, str):
                    raise ValueError(
                        "Course name must be text."
                    )

                cutoff_from = get_decimal(
                    program_data.get("cutoff_from")
                )

                cutoff_to = get_decimal(
                    program_data.get("cutoff_to")
                )

                branch_fee = get_decimal(
                    program_data.get("branch_fee")
                )

                validate_non_negative(cutoff_from, "Cutoff from")
                validate_non_negative(cutoff_to, "Cutoff to")
                validate_non_negative(branch_fee, "Branch fee")

                if (
                    cutoff_from is not None
                    and cutoff_to is not None
                    and cutoff_from > cutoff_to
                ):
                    raise ValueError(
                        "Cutoff to must be greater than or "
                        "equal to cutoff from."
                    )

                branch, _ = Branch.objects.get_or_create(
                    name=branch_name
                )

                ProgramBranch.objects.create(
                    institution=institution,
                    program_type=program_type,
                    course=course_name.strip(),
                    branch=branch,
                    cutoff_from=cutoff_from,
                    cutoff_to=cutoff_to,
                    branch_fee=branch_fee,
                )

            # OFFICIAL WEBSITE IMAGES

            official_image_urls = get_json_data(
                request,
                "official_image_urls",
                []
            )

            if not isinstance(official_image_urls, list):
                raise ValueError(
                    "Official image URLs must be a list."
                )

            image_url_saved = False

            for image_item in official_image_urls:

                if isinstance(image_item, dict):

                    image_url = image_item.get(
                        "url",
                        ""
                    )

                    is_primary = get_bool(
                        image_item.get("selected"),
                        False
                    )

                else:
                    image_url = image_item
                    is_primary = False

                if not isinstance(image_url, str):
                    raise ValueError(
                        "Invalid image URL."
                    )

                image_url = image_url.strip()

                if not valid_http_url(image_url):
                    raise ValueError(
                        "Invalid official image URL."
                    )

                InstitutionImage.objects.create(
                    institution=institution,
                    image_url=image_url,
                    is_primary=(
                        is_primary or not image_url_saved
                    ),
                )

                image_url_saved = True

            # UPLOADED IMAGES

            uploaded_images = request.FILES.getlist(
                "images"
            )

            for index, image_file in enumerate(uploaded_images):

                InstitutionImage.objects.create(
                    institution=institution,
                    image=image_file,
                    is_primary=(
                        not image_url_saved and index == 0
                    ),
                )

            serializer = self.get_serializer(
                institution
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        except (
            ValueError,
            TypeError,
            InvalidOperation,
            IntegrityError,
        ) as error:

            return Response(
                {"error": str(error)},
                status=status.HTTP_400_BAD_REQUEST
            )

    # --------------------------------------------------------
    # UPDATE INSTITUTION
    # --------------------------------------------------------

    def perform_update(self, serializer):

        institution = self.get_object()

        serializer.save(
            created_by=institution.created_by
        )


# ============================================================
# INTER GROUP VIEWSET
# ============================================================

class InterGroupViewSet(viewsets.ModelViewSet):

    queryset = InterGroup.objects.select_related(
        "institution"
    )

    serializer_class = InterGroupSerializer
    permission_classes = [RelatedInstitutionPermission]

    def get_queryset(self):

        queryset = super().get_queryset()
        user = self.request.user

        if is_admin_user(user):
            return queryset

        if is_approved_authority(user):
            return queryset.filter(
                institution__created_by=user
            )

        return queryset.filter(
            institution__approval_status=(
                Institution.ApprovalStatus.APPROVED
            )
        )

    def perform_create(self, serializer):

        institution = serializer.validated_data.get(
            "institution"
        )

        if not can_manage_institution(
            self.request.user,
            institution
        ):
            raise PermissionDenied(
                "You cannot add groups to this institution."
            )

        serializer.save()


# ============================================================
# BRANCH VIEWSET
# ============================================================

class BranchViewSet(viewsets.ModelViewSet):

    queryset = Branch.objects.all()
    serializer_class = BranchSerializer
    permission_classes = [AdminOnlyMutationPermission]


# ============================================================
# COURSE OFFERING VIEWSET
# ============================================================

class CourseOfferingViewSet(viewsets.ModelViewSet):

    queryset = CourseOffering.objects.select_related(
        "institution"
    ).prefetch_related(
        "branches"
    )

    serializer_class = CourseOfferingSerializer
    permission_classes = [RelatedInstitutionPermission]

    def get_queryset(self):

        queryset = super().get_queryset()
        user = self.request.user

        if is_admin_user(user):
            return queryset

        if is_approved_authority(user):
            return queryset.filter(
                institution__created_by=user
            )

        return queryset.filter(
            institution__approval_status=(
                Institution.ApprovalStatus.APPROVED
            )
        )

    def perform_create(self, serializer):

        institution = serializer.validated_data.get(
            "institution"
        )

        if not can_manage_institution(
            self.request.user,
            institution
        ):
            raise PermissionDenied(
                "You cannot add courses to this institution."
            )

        serializer.save()


# ============================================================
# PROGRAM BRANCH VIEWSET
# ============================================================

class ProgramBranchViewSet(viewsets.ModelViewSet):

    queryset = ProgramBranch.objects.select_related(
        "institution",
        "branch"
    )

    serializer_class = ProgramBranchSerializer
    permission_classes = [RelatedInstitutionPermission]

    def get_queryset(self):

        queryset = super().get_queryset()
        user = self.request.user

        if is_admin_user(user):
            return queryset

        if is_approved_authority(user):
            return queryset.filter(
                institution__created_by=user
            )

        return queryset.filter(
            institution__approval_status=(
                Institution.ApprovalStatus.APPROVED
            )
        )

    def perform_create(self, serializer):

        institution = serializer.validated_data.get(
            "institution"
        )

        if not can_manage_institution(
            self.request.user,
            institution
        ):
            raise PermissionDenied(
                "You cannot add branches to this institution."
            )

        serializer.save()


# ============================================================
# INSTITUTION IMAGE VIEWSET
# ============================================================

class InstitutionImageViewSet(viewsets.ModelViewSet):

    queryset = InstitutionImage.objects.select_related(
        "institution"
    )

    serializer_class = InstitutionImageSerializer
    permission_classes = [RelatedInstitutionPermission]

    def get_queryset(self):

        queryset = super().get_queryset()
        user = self.request.user

        if is_admin_user(user):
            return queryset

        if is_approved_authority(user):
            return queryset.filter(
                institution__created_by=user
            )

        return queryset.filter(
            institution__approval_status=(
                Institution.ApprovalStatus.APPROVED
            )
        )

    def perform_create(self, serializer):

        institution = serializer.validated_data.get(
            "institution"
        )

        if not can_manage_institution(
            self.request.user,
            institution
        ):
            raise PermissionDenied(
                "You cannot add images to this institution."
            )

        serializer.save()


# ============================================================
# DIPLOMA COLLEGES
# ============================================================

@api_view(["GET"])
def diploma_colleges(request):

    institutions = Institution.objects.filter(
        program_branches__program_type="diploma",
        approval_status=Institution.ApprovalStatus.APPROVED
    ).distinct().select_related(
        "created_by"
    ).prefetch_related(
        "images",
        "inter_groups",
        "courses__branches",
        "program_branches__branch",
    )

    serializer = InstitutionSerializer(
        institutions,
        many=True
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK
    )
