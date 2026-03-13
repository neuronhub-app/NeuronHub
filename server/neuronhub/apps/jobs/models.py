import uuid
from zoneinfo import ZoneInfo

from django.db import models
from django.utils.crypto import salted_hmac
from django_extensions.db.fields import AutoSlugField
from simple_history.models import HistoricalRecords
from timezone_field import TimeZoneField

from neuronhub.apps.algolia.models_abstract import AlgoliaModel
from neuronhub.apps.anonymizer.registry import anonymizable
from neuronhub.apps.db.models_abstract import TimeStampedModel
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.posts.graphql.types_lazy import TagCategoryEnum
from neuronhub.apps.users.graphql.types_lazy import UserListName
from neuronhub.apps.users.models import User
from neuronhub.apps.users.models import UserConnectionGroup


class Job(AlgoliaModel):
    author = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )

    title = models.CharField(max_length=512)

    description = models.TextField(blank=True)

    slug = AutoSlugField(populate_from=["title", "org__name"])

    org = models.ForeignKey(
        Org,
        on_delete=models.PROTECT,
        related_name="jobs",
    )

    is_remote = models.BooleanField(blank=True, null=True)
    is_remote_friendly = models.BooleanField(blank=True, null=True)
    salary_min = models.PositiveIntegerField(blank=True, null=True)
    salary_text = models.TextField(
        blank=True, help_text="Orgs can specify multiple ranges for multiple locations."
    )

    tags_skill = models.ManyToManyField(  # type: ignore[var-annotated]  #bad-infer
        "posts.PostTag",
        limit_choices_to={"categories__name": TagCategoryEnum.Skill},
        related_name=f"tags_job_{TagCategoryEnum.Skill.value}",
        blank=True,
    )
    tags_area = models.ManyToManyField(  # type: ignore[var-annotated]  #bad-infer
        "posts.PostTag",
        limit_choices_to={"categories__name": TagCategoryEnum.Area},
        related_name=f"tags_job_{TagCategoryEnum.Area.value}",
        blank=True,
    )
    tags_education = models.ManyToManyField(  # type: ignore[var-annotated]  #bad-infer
        "posts.PostTag",
        limit_choices_to={"categories__name": TagCategoryEnum.Education},
        related_name=f"tags_job_{TagCategoryEnum.Education.value}",
        blank=True,
    )
    tags_experience = models.ManyToManyField(  # type: ignore[var-annotated]  #bad-infer
        "posts.PostTag",
        limit_choices_to={"categories__name": TagCategoryEnum.Experience},
        related_name=f"tags_job_{TagCategoryEnum.Experience.value}",
        blank=True,
    )
    tags_workload = models.ManyToManyField(  # type: ignore[var-annotated]  #bad-infer
        "posts.PostTag",
        limit_choices_to={"categories__name": TagCategoryEnum.Workload},
        related_name=f"tags_job_{TagCategoryEnum.Workload.value}",
        blank=True,
    )

    tags_country = models.ManyToManyField(  # type: ignore[var-annotated]  #bad-infer
        "posts.PostTag",
        limit_choices_to={"categories__name": TagCategoryEnum.Country},
        related_name=f"tags_job_{TagCategoryEnum.Country.value}",
        blank=True,
    )
    tags_city = models.ManyToManyField(  # type: ignore[var-annotated]  #bad-infer
        "posts.PostTag",
        limit_choices_to={"categories__name": TagCategoryEnum.City},
        related_name=f"tags_job_{TagCategoryEnum.City.value}",
        blank=True,
    )

    tags_country_visa_sponsor = models.ManyToManyField(  # type: ignore[var-annotated]  #bad-infer
        "posts.PostTag",
        related_name="visa_sponsor_jobs",
        blank=True,
        help_text="Country PostTags where this job sponsors visas",
    )

    url_external = models.CharField(blank=True, max_length=1024, verbose_name="URL")

    is_published = models.BooleanField(default=True)

    versions = models.ManyToManyField(  # type: ignore[var-annotated]  #bad-infer
        "self",
        symmetrical=False,
        blank=True,
        related_name="version_of",
    )

    bookmarked_by_users = models.ManyToManyField(  # type: ignore[var-annotated]  #bad-infer
        User, related_name=UserListName.jobs_bookmarked.value, blank=True
    )

    posted_at = models.DateTimeField(null=True, blank=True)
    closes_at = models.DateTimeField(null=True, blank=True)

    visible_to_users = anonymizable(  # type: ignore[var-annotated, assignment]  #bad-infer: anonymizable() wrapper
        models.ManyToManyField(User, related_name="jobs_visible", blank=True)
    )
    visible_to_groups = anonymizable(  # type: ignore[var-annotated, assignment]  #bad-infer: anonymizable() wrapper
        models.ManyToManyField(UserConnectionGroup, related_name="jobs_visible", blank=True),
    )

    history = HistoricalRecords(excluded_fields=["slug"])

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["slug", "is_published"],
                name="unique_job_slug_is_published",
            ),
        ]

    graphql_query_for_algolia: str = "JobsByIds"
    graphql_query_for_algolia_field: str = "jobs"

    def is_in_algolia_index(self) -> bool:
        return self.is_published

    def get_unix_posted_at(self) -> float | None:
        return self.posted_at.timestamp() if self.posted_at else None

    def get_unix_closes_at(self) -> float | None:
        return self.closes_at.timestamp() if self.closes_at else None

    def get_iso_posted_at(self) -> str:
        return self.posted_at.isoformat() if self.posted_at else ""

    def get_iso_closes_at(self) -> str:
        return self.closes_at.isoformat() if self.closes_at else ""

    def get_tags_json_skill(self):
        return self._get_graphql_field("tags_skill")

    def get_tags_json_area(self):
        return self._get_graphql_field("tags_area")

    def get_tags_json_education(self):
        return self._get_graphql_field("tags_education")

    def get_tags_json_experience(self):
        return self._get_graphql_field("tags_experience")

    def get_tags_json_workload(self):
        return self._get_graphql_field("tags_workload")

    def get_tags_json_country(self):
        return self._get_graphql_field("tags_country")

    def get_tags_json_city(self):
        return self._get_graphql_field("tags_city")

    def get_tags_country_visa_sponsor_json(self):
        """
        #AI-slop - should be _get_graphql_field
        """
        return [{"name": tag.name} for tag in self.tags_country_visa_sponsor.all()]

    def get_org_json(self):
        return self._get_graphql_field("org")

    def __str__(self):
        return self.title


# todo ? refac-name: JobEmailSubscription
class JobAlert(TimeStampedModel):
    id_ext = models.UUIDField(default=uuid.uuid4)

    email = models.EmailField()

    tags = models.ManyToManyField(  # type: ignore[var-annotated]  #bad-infer
        "posts.PostTag",
        related_name="tags",
        blank=True,
    )
    is_orgs_highlighted = models.BooleanField(blank=True, null=True)
    is_remote = models.BooleanField(blank=True, null=True)
    salary_min = models.PositiveIntegerField(blank=True, null=True)

    tz: ZoneInfo = TimeZoneField(blank=True, default="")

    is_active = models.BooleanField(default=True)

    sent_count = models.PositiveIntegerField(default=0)
    jobs_clicked_count = models.PositiveIntegerField(default=0)
    jobs_clicked = models.ManyToManyField(Job, blank=True)

    history = HistoricalRecords()

    def __str__(self):
        return f"JobAlert({self.pk}, {self.email}, active={self.is_active})"


# todo ? refac-name: JobEmailLog
class JobAlertLog(TimeStampedModel):
    job_alert = models.ForeignKey(
        JobAlert,
        on_delete=models.SET_NULL,
        null=True,
        related_name="logs",
    )
    job = models.ForeignKey(
        Job,
        on_delete=models.SET_NULL,
        null=True,
        related_name="alert_logs",
    )
    email_hash = models.CharField(max_length=128)
    sent_at = models.DateTimeField(auto_now_add=True)

    @staticmethod
    def hash_email(email: str) -> str:
        return salted_hmac(key_salt="JobAlertLog", value=email).hexdigest()
