import uuid
from zoneinfo import ZoneInfo

from django.core.cache import cache
from django.db import models
from django.utils.crypto import salted_hmac
from django_extensions.db.fields import AutoSlugField
from simple_history.models import HistoricalRecords
from strawberry_django.descriptors import model_cached_property
from timezone_field import TimeZoneField

from neuronhub.apps.algolia.models_abstract import AlgoliaModel
from neuronhub.apps.anonymizer.registry import anonymizable
from neuronhub.apps.db.fields import MarkdownField
from neuronhub.apps.db.models_abstract import TimeStampedModel
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.posts.graphql.types_lazy import TagCategoryEnum
from neuronhub.apps.sites.models import url_with_utm_help_text
from neuronhub.apps.users.graphql.types_lazy import UserListName
from neuronhub.apps.users.models import User
from neuronhub.apps.users.models import UserConnectionGroup


class JobLocation(models.Model):
    """
    Initially was handled by tags_country & tags_city - but UX is better when it's a single "field".
    """

    name = models.CharField(max_length=255, unique=True)
    city = models.CharField(max_length=255, blank=True)
    country = models.CharField(max_length=255, blank=True)
    region = models.CharField(max_length=255, blank=True)
    is_remote = models.BooleanField(default=False)

    @model_cached_property
    def remote_name(self) -> str:
        return self.name if self.is_remote else ""


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

    locations = models.ManyToManyField(
        JobLocation,
        blank=True,
    )

    tags_country_visa_sponsor = models.ManyToManyField(  # type: ignore[var-annotated]  #bad-infer
        "posts.PostTag",
        related_name="visa_sponsor_jobs",
        blank=True,
        help_text="Country PostTags where this job sponsors visas",
    )

    url_external = models.CharField(blank=True, max_length=1024, verbose_name="URL")
    url_external_with_utm = models.CharField(
        blank=True,
        max_length=1024,
        help_text=url_with_utm_help_text,
    )

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

    history = HistoricalRecords(
        excluded_fields=["slug"],
        m2m_fields=[
            versions,
            locations,
            visible_to_users,
            visible_to_groups,
            # tags
            tags_skill,
            tags_area,
            tags_education,
            tags_experience,
            tags_workload,
            tags_country_visa_sponsor,
        ],
    )

    tag_category_to_field = {
        TagCategoryEnum.Skill: "tags_skill",
        TagCategoryEnum.Area: "tags_area",
        TagCategoryEnum.Education: "tags_education",
        TagCategoryEnum.Experience: "tags_experience",
        TagCategoryEnum.Workload: "tags_workload",
        TagCategoryEnum.VisaSponsorship: "tags_country_visa_sponsor",
    }

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

    def get_json_locations(self):
        return self._get_graphql_field("locations")

    def get_unix_posted_at(self) -> float | None:
        return self.posted_at.timestamp() if self.posted_at else None

    def get_unix_closes_at(self) -> float | None:
        return self.closes_at.timestamp() if self.closes_at else None

    def get_iso_posted_at(self) -> str:
        return self.posted_at.isoformat() if self.posted_at else ""

    def get_iso_closes_at(self) -> str:
        return self.closes_at.isoformat() if self.closes_at else ""

    def get_json_tags_skill(self):
        return self._get_graphql_field("tags_skill")

    def get_json_tags_area(self):
        return self._get_graphql_field("tags_area")

    def get_json_tags_education(self):
        return self._get_graphql_field("tags_education")

    def get_json_tags_experience(self):
        return self._get_graphql_field("tags_experience")

    def get_json_tags_workload(self):
        return self._get_graphql_field("tags_workload")

    def get_json_tags_country_visa_sponsor(self):
        """
        #AI-slop - should be _get_graphql_field
        """
        return [{"name": tag.name} for tag in self.tags_country_visa_sponsor.all()]

    def get_org_json(self):
        return self._get_graphql_field("org")

    def __str__(self):
        return self.title


class JobAlert(TimeStampedModel):
    id_ext = models.UUIDField(default=uuid.uuid4)

    email = models.EmailField()

    tags = models.ManyToManyField(  # type: ignore[var-annotated]  #bad-infer
        "posts.PostTag",
        related_name="tags",
        blank=True,
    )
    is_orgs_highlighted = models.BooleanField(blank=True, null=True)
    locations = models.ManyToManyField(
        JobLocation,
        blank=True,
    )
    is_remote = models.BooleanField(blank=True, null=True)
    salary_min = models.PositiveIntegerField(blank=True, null=True)

    tz: ZoneInfo = TimeZoneField(blank=True, default="")

    is_active = models.BooleanField(default=True)

    sent_count = models.PositiveIntegerField(default=0)
    jobs_notified_count = models.PositiveIntegerField(default=0)
    jobs_clicked_count = models.PositiveIntegerField(default=0)
    jobs_clicked = models.ManyToManyField(Job, blank=True)

    # Note: minimal, as the rest is tracked by [[JobAlertLog]]
    history = HistoricalRecords(
        excluded_fields=["jobs_notified_count"],
        m2m_fields=[tags],
    )

    def __str__(self):
        is_active_flag = "" if self.is_active else ", inactive"
        return f"Alert(#{self.pk}, {self.email}{is_active_flag})"


class JobFaqQuestion(models.Model):
    site = models.ForeignKey(
        "sites.SiteConfig",
        on_delete=models.CASCADE,
        related_name="faq_questions",
    )
    question = models.CharField(max_length=512)
    answer_md = MarkdownField()
    order = models.PositiveIntegerField(default=0, db_index=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.question


def _on_change_invalidate_cache_job_faq(**kwargs):
    from neuronhub.apps.jobs.graphql import JobsQuery

    cache.delete(JobsQuery.CacheKey.Faq)


models.signals.post_save.connect(_on_change_invalidate_cache_job_faq, sender=JobFaqQuestion)
models.signals.post_delete.connect(_on_change_invalidate_cache_job_faq, sender=JobFaqQuestion)


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
    email_hash = models.CharField(max_length=128, blank=True)
    jobs_notified_count = models.PositiveIntegerField(default=0)
    sent_at = models.DateTimeField(auto_now_add=True)

    @staticmethod
    def hash_email(email: str) -> str:
        return salted_hmac(key_salt="JobAlertLog", value=email).hexdigest()
