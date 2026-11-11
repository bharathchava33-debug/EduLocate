
import secrets
from datetime import timedelta

from django.contrib.auth.models import User
from django.contrib.auth import authenticate, password_validation
from django.contrib.auth.hashers import make_password, check_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile, PasswordResetCode
from institutions.models import Institution

# ==================================================
# HELPER FUNCTIONS
# ==================================================

def is_admin(user):
    if user.is_superuser:
        return True

    try:
        return user.profile.role == "admin"
    except UserProfile.DoesNotExist:
        return False


def get_user_profile(user):
    profile, created = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            "role": "student",
            "approval_status": "approved",
        },
    )

    if user.is_superuser and profile.role != "admin":
        profile.role = "admin"
        profile.approval_status = "approved"
        profile.save()

    return profile


# ==================================================
# ADMIN: VIEW ALL REGISTERED USERS
# ==================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def users_list(request):

    if not is_admin(request.user):
        return Response(
            {"error": "Only Admin can view registered users."},
            status=status.HTTP_403_FORBIDDEN,
        )

    profiles = UserProfile.objects.select_related("user").exclude(
        role="admin"
    ).exclude(
        user__is_superuser=True
    ).order_by("-user__date_joined")

    data = [
        {
            "id": profile.user.id,
            "name": profile.user.first_name,
            "username": profile.user.username,
            "email": profile.user.email,
            "role": profile.role,
            "approval_status": profile.approval_status,
            "is_active": profile.user.is_active,
            "date_joined": profile.user.date_joined,
        }
        for profile in profiles
    ]

    return Response(data, status=status.HTTP_200_OK)


# ==================================================
# REGISTRATION
# ==================================================

@api_view(["POST"])
def register_user(request):

    name = request.data.get("name", "").strip()
    username = request.data.get("username", "").strip()
    email = request.data.get("email", "").strip().lower()
    password = request.data.get("password", "")
    confirm_password = request.data.get("confirm_password", "")
    role = request.data.get("role", "student").strip().lower()

    if not all([name, username, email, password, confirm_password]):
        return Response(
            {"error": "All five fields are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if role == "user":
        role = "student"

    if role not in ["student", "authority"]:
        return Response(
            {"error": "Select User or Institution Authority."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if password != confirm_password:
        return Response(
            {"error": "Passwords do not match."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(username__iexact=username).exists():
        return Response(
            {"error": "Username already exists."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if User.objects.filter(email__iexact=email).exists():
        return Response(
            {"error": "Email already registered."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User(
        username=username,
        email=email,
        first_name=name,
    )

    try:
        password_validation.validate_password(password, user)
    except ValidationError as error:
        return Response(
            {"error": error.messages},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(password)
    user.save()

    approval_status = "pending" if role == "authority" else "approved"

    UserProfile.objects.create(
        user=user,
        role=role,
        approval_status=approval_status,
    )

    message = (
        "Registration successful. Your Institution Authority account is waiting for Admin approval."
        if role == "authority"
        else "Registered successfully! You can now log in."
    )

    return Response(
        {
            "message": message,
            "name": user.first_name,
            "username": user.username,
            "email": user.email,
            "role": role,
            "approval_status": approval_status,
        },
        status=status.HTTP_201_CREATED,
    )


# ==================================================
# LOGIN
# ==================================================

@api_view(["POST"])
def login_user(request):

    username = request.data.get("username", "").strip()
    password = request.data.get("password", "")

    if not username or not password:
        return Response(
            {"error": "Username and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {"error": "Invalid username or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.is_active:
        return Response(
            {"error": "This account is disabled."},
            status=status.HTTP_403_FORBIDDEN,
        )

    profile = get_user_profile(user)

    if profile.role == "authority":
        if profile.approval_status == "pending":
            return Response(
                {"error": "Your Institution Authority account is waiting for Admin approval."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if profile.approval_status == "rejected":
            return Response(
                {"error": "Your Institution Authority registration was rejected. Please contact Admin."},
                status=status.HTTP_403_FORBIDDEN,
            )

    refresh = RefreshToken.for_user(user)

    return Response(
        {
            "message": "Login successful.",
            "name": user.first_name,
            "username": user.username,
            "email": user.email,
            "role": profile.role,
            "approval_status": profile.approval_status,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        },
        status=status.HTTP_200_OK,
    )


# ==================================================
# ADMIN: VIEW AUTHORITY APPROVAL REQUESTS
# ==================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def authority_requests(request):

    if not is_admin(request.user):
        return Response(
            {"error": "Only Admin can view approval requests."},
            status=status.HTTP_403_FORBIDDEN,
        )

    profiles = UserProfile.objects.filter(
        role="authority",
        approval_status="pending",
    ).select_related("user")

    data = [
        {
            "id": profile.user.id,
            "name": profile.user.first_name,
            "username": profile.user.username,
            "email": profile.user.email,
            "approval_status": profile.approval_status,
        }
        for profile in profiles
    ]

    return Response(data, status=status.HTTP_200_OK)


# ==================================================
# ADMIN: APPROVE OR REJECT AUTHORITY
# ==================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def update_authority_status(request, user_id):

    if not is_admin(request.user):
        return Response(
            {"error": "Only Admin can approve or reject authorities."},
            status=status.HTTP_403_FORBIDDEN,
        )

    action = request.data.get("action", "").lower()

    if action not in ["approve", "reject"]:
        return Response(
            {"error": "Action must be approve or reject."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        profile = UserProfile.objects.get(
            user_id=user_id,
            role="authority",
        )
    except UserProfile.DoesNotExist:
        return Response(
            {"error": "Institution Authority account not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    profile.approval_status = (
        "approved" if action == "approve" else "rejected"
    )

    profile.save(update_fields=["approval_status"])

    return Response(
        {
            "message": f"Institution Authority {action}d successfully.",
            "username": profile.user.username,
            "approval_status": profile.approval_status,
        },
        status=status.HTTP_200_OK,
    )


# ==================================================
# FORGOT PASSWORD: SEND EMAIL VERIFICATION CODE
# ==================================================

@api_view(["POST"])
def request_password_reset(request):

    email = request.data.get("email", "").strip().lower()

    if not email:
        return Response(
            {"error": "Email address is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.filter(email__iexact=email).first()

    if user:
        try:
            profile = user.profile
        except UserProfile.DoesNotExist:
            profile = None

        if profile and profile.role in ["student", "authority"]:

            code = f"{secrets.randbelow(1000000):06d}"

            PasswordResetCode.objects.filter(user=user).delete()

            reset_record = PasswordResetCode.objects.create(
                user=user,
                code_hash=make_password(code),
                expires_at=timezone.now() + timedelta(minutes=10),
            )

            try:
                send_mail(
                    subject="EduLocate Password Reset Verification",
                    message=(
                        f"Hello {user.first_name or user.username},\n\n"
                        f"Your EduLocate verification code is: {code}\n\n"
                        "This code expires in 10 minutes. "
                        "Do not share it with anyone."
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                    fail_silently=False,
                )

            except Exception:
                reset_record.delete()

                return Response(
                    {"error": "Unable to send verification email. Please try again later."},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

    return Response(
        {
            "message": "If this email belongs to an eligible EduLocate account, a verification code has been sent."
        },
        status=status.HTTP_200_OK,
    )


# ==================================================
# FORGOT PASSWORD: VERIFY EMAIL CODE
# ==================================================

@api_view(["POST"])
def verify_password_reset_code(request):

    email = request.data.get("email", "").strip().lower()
    code = request.data.get("code", "").strip()

    if not email or not code:
        return Response(
            {"error": "Email and verification code are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.filter(email__iexact=email).first()

    if not user:
        return Response(
            {"error": "Invalid or expired verification code."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    reset_record = PasswordResetCode.objects.filter(
        user=user
    ).order_by("-created_at").first()

    if not reset_record or reset_record.is_verified:
        return Response(
            {"error": "Invalid or expired verification code."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if timezone.now() > reset_record.expires_at:
        reset_record.delete()

        return Response(
            {"error": "Verification code has expired. Request a new code."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if reset_record.attempts >= 5:
        reset_record.delete()

        return Response(
            {"error": "Too many incorrect attempts. Request a new code."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    reset_record.attempts += 1

    if not check_password(code, reset_record.code_hash):
        reset_record.save(update_fields=["attempts"])

        return Response(
            {"error": "Incorrect verification code."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    reset_token = secrets.token_urlsafe(32)

    reset_record.is_verified = True
    reset_record.reset_token_hash = make_password(reset_token)
    reset_record.reset_token_expires_at = (
        timezone.now() + timedelta(minutes=10)
    )

    reset_record.save()

    return Response(
        {
            "message": "Email verified successfully.",
            "reset_token": reset_token,
        },
        status=status.HTTP_200_OK,
    )


# ==================================================
# FORGOT PASSWORD: SAVE NEW PASSWORD
# ==================================================

@api_view(["POST"])
def reset_password(request):

    email = request.data.get("email", "").strip().lower()
    reset_token = request.data.get("reset_token", "")
    new_password = request.data.get("new_password", "")
    confirm_password = request.data.get("confirm_password", "")

    if not all([email, reset_token, new_password, confirm_password]):
        return Response(
            {"error": "All fields are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if new_password != confirm_password:
        return Response(
            {"error": "Passwords do not match."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.filter(email__iexact=email).first()

    if not user:
        return Response(
            {"error": "Invalid password reset request."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    reset_record = PasswordResetCode.objects.filter(
        user=user,
        is_verified=True,
    ).order_by("-created_at").first()

    if (
        not reset_record
        or not reset_record.reset_token_expires_at
        or timezone.now() > reset_record.reset_token_expires_at
        or not check_password(reset_token, reset_record.reset_token_hash)
    ):
        return Response(
            {"error": "Password reset verification has expired. Start again."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        password_validation.validate_password(new_password, user)
    except ValidationError as error:
        return Response(
            {"error": error.messages},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(new_password)
    user.save()

    reset_record.delete()

    return Response(
        {"message": "Password changed successfully. Please log in."},
        status=status.HTTP_200_OK,
    )
    
# ==================================================
# AUTHORITY: VIEW OWN APPROVAL STATUS
# ==================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def authority_approval_status(request):

    profile = get_user_profile(request.user)

    if profile.role != "authority":
        return Response(
            {"error": "Only Institution Authorities can access this page."},
            status=status.HTTP_403_FORBIDDEN,
        )

    institution_list = Institution.objects.filter(
        created_by=request.user
    ).order_by("-created_at")

    institutions_data = [
        {
            "id": institution.id,
            "name": institution.name,
            "education_level": institution.education_level,
            "location": institution.location,
            "district": institution.district,
            "state": institution.state,
            "approval_status": institution.approval_status,
            "created_at": institution.created_at,
            "updated_at": institution.updated_at,
        }
        for institution in institution_list
    ]

    return Response(
        {
            "authority": {
                "name": request.user.first_name,
                "username": request.user.username,
                "email": request.user.email,
                "approval_status": profile.approval_status,
            },
            "institutions": institutions_data,
        },
        status=status.HTTP_200_OK,
    )
