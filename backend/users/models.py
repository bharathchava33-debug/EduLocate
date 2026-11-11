
from django.db import models
from django.contrib.auth.models import User


ROLE_CHOICES = [
    ("student", "User"),
    ("admin", "Admin"),
    ("authority", "Institution Authority"),
]

APPROVAL_CHOICES = [
    ("pending", "Pending"),
    ("approved", "Approved"),
    ("rejected", "Rejected"),
]


class UserProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="student",
    )

    approval_status = models.CharField(
        max_length=20,
        choices=APPROVAL_CHOICES,
        default="approved",
    )

    def __str__(self):
        return f"{self.user.username} - {self.role} ({self.approval_status})"


class PasswordResetCode(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="password_reset_codes",
    )

    code_hash = models.CharField(max_length=256)

    expires_at = models.DateTimeField()

    attempts = models.PositiveIntegerField(default=0)

    is_verified = models.BooleanField(default=False)

    reset_token_hash = models.CharField(
        max_length=256,
        blank=True,
    )

    reset_token_expires_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Password reset for {self.user.username}"
