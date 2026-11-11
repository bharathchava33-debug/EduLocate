
from django.urls import path

from . import views

urlpatterns = [
    path("register/", views.register_user, name="register"),
    path("login/", views.login_user, name="login"),

    # Admin APIs
    path("", views.users_list, name="users-list"),
    path(
        "authority-requests/",
        views.authority_requests,
        name="authority-requests",
    ),
    path(
        "authority-requests/<int:user_id>/",
        views.update_authority_status,
        name="update-authority-status",
    ),

    # Password reset APIs
    path(
        "forgot-password/",
        views.request_password_reset,
        name="forgot-password",
    ),
    path(
        "verify-reset-code/",
        views.verify_password_reset_code,
        name="verify-reset-code",
    ),
    path(
        "reset-password/",
        views.reset_password,
        name="reset-password",
    ),
    path(
    "authority-approval-status/",
    views.authority_approval_status,
    name="authority-approval-status",
),
]
