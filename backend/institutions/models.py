
from django.db import models
from django.conf import settings


class Institution(models.Model):

    # EDUCATION LEVEL
    class EducationLevel(models.TextChoices):
        SCHOOL = "school", "School"
        INTER_COLLEGE = "inter_college", "Inter College"
        DIPLOMA = "diploma", "Diploma College"
        ENGINEERING = "engineering", "Engineering College"
        DEGREE = "degree", "Degree College"

    # COLLEGE TYPE
    class CollegeType(models.TextChoices):
        GOVERNMENT = "government", "Government"
        AIDED = "aided", "Aided"
        PRIVATE = "private", "Private"

    # INSTITUTION TYPE
    class InstitutionType(models.TextChoices):
        AUTONOMOUS = "autonomous", "Autonomous"
        JNTU = "jntu", "JNTU"
        UNIVERSITY = "university", "University"
        DEEMED_UNIVERSITY = "deemed_university", "Deemed University"
        OTHER = "other", "Other"

    # APPROVAL STATUS
    class ApprovalStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    # BASIC INFORMATION
    name = models.CharField(max_length=200)

    # USER WHO CREATED THE INSTITUTION
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_institutions",
    )

    # INSTITUTION APPROVAL
    approval_status = models.CharField(
        max_length=20,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
    )

    education_level = models.CharField(
        max_length=30,
        choices=EducationLevel.choices,
    )

    location = models.CharField(max_length=300, blank=True)
    district = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)

    # GOOGLE PLACES DATA
    google_place_id = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        unique=True,
    )

    google_maps_url = models.URLField(
        blank=True,
        null=True,
    )

    latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        blank=True,
        null=True,
    )

    longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        blank=True,
        null=True,
    )

    rating = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        blank=True,
        null=True,
    )

    review_count = models.PositiveIntegerField(default=0)

    phone = models.CharField(max_length=30, blank=True)

    email = models.EmailField(
        blank=True,
        null=True,
    )

    # OFFICIAL WEBSITE
    website = models.URLField(
        blank=True,
        null=True,
    )

    description = models.TextField(
        blank=True,
        null=True,
    )

    # COLLEGE TYPE
    college_type = models.CharField(
        max_length=20,
        choices=CollegeType.choices,
        blank=True,
        null=True,
    )

    # AUTONOMOUS STATUS
    autonomous = models.BooleanField(default=False)

    # INSTITUTION TYPE
    institution_type = models.CharField(
        max_length=30,
        choices=InstitutionType.choices,
        blank=True,
        null=True,
    )

    # AFFILIATION AND APPROVAL
    affiliated_to = models.CharField(
        max_length=200,
        blank=True,
        null=True,
    )

    approved_by = models.CharField(
        max_length=200,
        blank=True,
        null=True,
    )

    # FACILITIES
    bus_facility = models.BooleanField(default=False)
    hostel_facility = models.BooleanField(default=False)

    hostel_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    # SCHOOL DATA
    school_classes = models.CharField(
        max_length=150,
        blank=True,
    )

    syllabus = models.CharField(
        max_length=50,
        blank=True,
    )

    class_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    # INTER DATA
    jee_main = models.BooleanField(default=False)

    # CREATED AND UPDATED
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


# INSTITUTION IMAGES
class InstitutionImage(models.Model):

    institution = models.ForeignKey(
        Institution,
        on_delete=models.CASCADE,
        related_name="images",
    )

    image = models.ImageField(
        upload_to="institutions/",
        blank=True,
        null=True,
    )

    image_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True,
    )

    is_primary = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.institution.name} Image"


# INTER GROUPS
class InterGroup(models.Model):

    institution = models.ForeignKey(
        Institution,
        on_delete=models.CASCADE,
        related_name="inter_groups",
    )

    group_name = models.CharField(max_length=100)

    group_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    hostel_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    def __str__(self):
        return f"{self.institution.name} - {self.group_name}"


# BRANCH
class Branch(models.Model):

    name = models.CharField(
        max_length=150,
        unique=True,
    )

    def __str__(self):
        return self.name


# COURSE OFFERING
class CourseOffering(models.Model):

    institution = models.ForeignKey(
        Institution,
        on_delete=models.CASCADE,
        related_name="courses",
    )

    course = models.CharField(max_length=150)

    branches = models.ManyToManyField(
        Branch,
        blank=True,
        related_name="course_offerings",
    )

    course_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    def __str__(self):
        return f"{self.institution.name} - {self.course}"


# PROGRAM BRANCH
class ProgramBranch(models.Model):

    class ProgramType(models.TextChoices):
        DIPLOMA = "diploma", "Diploma"
        ENGINEERING = "engineering", "Engineering"
        DEGREE = "degree", "Degree"

    institution = models.ForeignKey(
        Institution,
        on_delete=models.CASCADE,
        related_name="program_branches",
    )

    program_type = models.CharField(
        max_length=20,
        choices=ProgramType.choices,
    )

    course = models.CharField(
        max_length=150,
        blank=True,
    )

    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="program_branches",
    )

    cutoff_from = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    cutoff_to = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    branch_fee = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        blank=True,
        null=True,
    )

    def __str__(self):
        if self.course:
            return (
                f"{self.institution.name} - "
                f"{self.course} - {self.branch.name}"
            )

        return (
            f"{self.institution.name} - "
            f"{self.program_type} - {self.branch.name}"
        )

class CutoffHistory(models.Model):

    class MeasurementType(models.TextChoices):
        RANK = "rank", "Rank"
        MARKS = "marks", "Marks"

    institution = models.ForeignKey(
        Institution,
        on_delete=models.CASCADE,
        related_name="cutoff_history"
    )

    program_type = models.CharField(
        max_length=20,
        choices=ProgramBranch.ProgramType.choices
    )

    course = models.CharField(
        max_length=150,
        blank=True
    )

    branch = models.ForeignKey(
        Branch,
        on_delete=models.CASCADE,
        related_name="cutoff_history"
    )

    admission_year = models.PositiveIntegerField()

    category = models.CharField(max_length=50)

    measurement_type = models.CharField(
        max_length=10,
        choices=MeasurementType.choices,
        default=MeasurementType.RANK
    )

    cutoff_value = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["admission_year"]

    def __str__(self):
        return (
            f"{self.institution.name} - "
            f"{self.branch.name} - "
            f"{self.admission_year}"
        )
# SAVED INSTITUTIONS
class SavedInstitution(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="saved_institutions"
    )

    institution = models.ForeignKey(
        Institution,
        on_delete=models.CASCADE,
        related_name="saved_by_users"
    )

    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "institution")
        ordering = ["-saved_at"]

    def __str__(self):
        return f"{self.user} - {self.institution.name}"
