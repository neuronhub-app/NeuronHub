import uuid
from typing import TYPE_CHECKING
from zoneinfo import ZoneInfo

from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.db.models import ManyToManyField
from django.db.models import TextChoices
from django.utils.crypto import salted_hmac
from django_choices_field.fields import TextChoicesField
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
from neuronhub.apps.users.models import UserAnon
from neuronhub.apps.users.models import UserConnectionGroup


if TYPE_CHECKING:
    from neuronhub.apps.posts.models import PostTag


class JobLocation(TimeStampedModel):
    """
    Initially was handled by tags_country & tags_city - but UX is better when it's a single "field".
    """

    class LocationType(TextChoices):
        COUNTRY = "country"
        CITY = "city"
        REMOTE = "remote"

    # todo ! refac: keep `.name` as runtime field - for admin.py & graphql
    # see [[JobsGen]].location for name gen example
    name = models.CharField(max_length=255, unique=True)
    type = TextChoicesField(choices_enum=LocationType, default=LocationType.CITY)
    city = models.CharField(max_length=255, blank=True)
    country = models.CharField(max_length=255, blank=True)
    region = models.CharField(max_length=255, blank=True)
    is_remote = models.BooleanField(default=False)

    @model_cached_property
    def algolia_filter_name(self) -> str:
        return f"[{self.type}] {self.name}"

    @model_cached_property
    def remote_name(self) -> str:
        return self.name if self.is_remote else ""

    def __str__(self):
        return self.name


class Job(AlgoliaModel):
    author = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )

    title = models.CharField(max_length=512)

    description = MarkdownField(blank=True, help_text="Use Markdown syntax.")

    slug = AutoSlugField(populate_from=["title", "org__name"], max_length=1024)

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
    tags_area: ManyToManyField[PostTag, PostTag] = models.ManyToManyField(  # type: ignore[var-annotated]  #bad-infer
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

    locations: ManyToManyField[JobLocation, JobLocation] = models.ManyToManyField(
        JobLocation,
        blank=True,
    )

    tags_country_visa_sponsor = models.ManyToManyField(  # type: ignore[var-annotated]  #bad-infer
        "posts.PostTag",
        related_name="visa_sponsor_jobs",
        blank=True,
        help_text="Country PostTags where this job sponsors visas",
    )

    class SourceExt(TextChoices):
        AIM = "AIM"

    source_ext = TextChoicesField(
        choices_enum=SourceExt,
        blank=True,
        null=True,
        default=None,
    )

    url_external = models.CharField(blank=True, max_length=1024, verbose_name="URL")
    url_external_with_utm = models.CharField(
        blank=True,
        max_length=1024,
        help_text=url_with_utm_help_text,
    )

    is_published = models.BooleanField(default=True)

    is_pending_removal = models.BooleanField(
        default=False,
        help_text="If this Job was removed in Airtable, the removal will have this flag, and will wait an approval on /jobs/drafts from an admin. Only meaningful when is_published=False.",
    )
    is_created_by_sync = models.BooleanField(
        default=False,
        help_text="Allows to update the existing Job draft from previous sync runs, instead of creating a new one each time and confusing the reviewer.",
    )
    is_duplicate_url_valid = models.BooleanField(
        default=False,
        help_text="Set from Airtable `Duplicate URL` - approved duplicate by data manager. Same-URL Jobs are collapsed to the latest `posted_at`.",
    )

    is_test_job = models.BooleanField(
        default=False,
        help_text=(
            "Excluded from Job Alerts outside of dev machines - by `DJANGO_ENV.is_dev()`. "
            "Indicates the Job was created by test_gen.py, eg in SiteConfig admin by 'Test Job Alert' button."
        ),
    )

    versions = models.ManyToManyField(  # type: ignore[var-annotated]  #bad-infer
        "self",
        symmetrical=False,
        blank=True,
        related_name="version_of",
    )

    bookmarked_by_users = models.ManyToManyField(  # type: ignore[var-annotated]  #bad-infer
        User, related_name=UserListName.jobs_bookmarked.value, blank=True
    )

    posted_at = models.DateTimeField()
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

    graphql_query_for_algolia: str = "JobsByIds"
    graphql_query_for_algolia_field: str = "jobs"

    # Algolia bool facets - inverted for exclude-filter FE UX.
    #
    # Uses .all() to hit prefetch_related cache - not .filter()
    boolean_facet_fields = [
        "has_salary",
        "is_orgs_highlighted",
        "is_not_career_capital",
        "is_not_profit_for_good",
    ]

    class Tags(TextChoices):
        # for BE/FE instead of magic strings
        CareerCapital = "Career-Capital"
        ProfitForGood = "Profit for Good"

    @model_cached_property
    def has_salary(self) -> bool:
        return bool(self.salary_min)

    @model_cached_property
    def is_orgs_highlighted(self) -> bool:
        return bool(self.org and self.org.is_highlighted)

    @model_cached_property
    def is_not_career_capital(self) -> bool:
        return not any(tag.name == self.Tags.CareerCapital.value for tag in self.tags_area.all())

    @model_cached_property
    def is_not_profit_for_good(self) -> bool:
        return not any(tag.name == self.Tags.ProfitForGood.value for tag in self.tags_area.all())

    def get_salary_min_or_zero(self) -> int:
        return self.salary_min or 0

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

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["slug"],
                condition=models.Q(is_published=True),
                name="unique_job_slug_when_is_published",
            ),
        ]


class JobAlert(TimeStampedModel):
    id_ext = models.UUIDField(default=uuid.uuid4)

    email = models.EmailField()

    tags = models.ManyToManyField(  # type: ignore[var-annotated]  #bad-infer
        "posts.PostTag",
        related_name="tags",
        blank=True,
    )
    is_orgs_highlighted = models.BooleanField(blank=True, null=True)
    locations: ManyToManyField[JobLocation, JobLocation] = models.ManyToManyField(
        JobLocation,
        blank=True,
    )
    is_remote = models.BooleanField(blank=True, null=True)
    salary_min = models.PositiveIntegerField(blank=True, null=True)
    is_exclude_no_salary = models.BooleanField(default=False)
    is_exclude_career_capital = models.BooleanField(blank=True, null=True)
    is_exclude_profit_for_good = models.BooleanField(blank=True, null=True)

    tz: ZoneInfo = TimeZoneField(blank=True, default="")

    is_active = models.BooleanField(default=True)
    is_invalid_location = models.BooleanField(default=False)

    sent_count = models.PositiveIntegerField(default=0)
    jobs_notified_count = models.PositiveIntegerField(default=0)
    jobs_clicked_count = models.PositiveIntegerField(default=0)
    jobs_clicked = ArrayField(
        models.CharField(max_length=1024),
        default=list,
        blank=True,
    )

    is_subscribe_to_newsletter = models.BooleanField(
        default=False,
        help_text="Whether the user checked the newsletter checkbox. The API sub may fail, but this flag will be checked still.",
    )

    # Note: minimal, as the rest is tracked by [[JobAlertLog]]
    history = HistoricalRecords(
        excluded_fields=["jobs_notified_count"],
        m2m_fields=[tags],
    )

    class Meta:
        get_latest_by = "pk"

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


class JobAlertLog(TimeStampedModel):
    job_alert = models.ForeignKey(
        JobAlert,
        on_delete=models.SET_NULL,
        null=True,
        related_name="logs",
    )
    user_anon = models.ForeignKey(
        UserAnon,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="alert_logs",
    )
    jobs = models.ManyToManyField(Job, related_name="alert_logs")
    email_hash = models.CharField(max_length=128, blank=True)
    sent_at = models.DateTimeField(auto_now_add=True)

    @staticmethod
    def hash_email(email: str) -> str:
        return salted_hmac(key_salt="JobAlertLog", value=email).hexdigest()
