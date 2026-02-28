import uuid

from django.contrib.postgres.fields import ArrayField
from django.db import models
from simple_history.models import HistoricalRecords

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

    org = models.ForeignKey(
        Org,
        on_delete=models.PROTECT,
        related_name="jobs",
    )

    is_remote = models.BooleanField(blank=True, null=True)
    is_remote_friendly = models.BooleanField(blank=True, null=True)
    is_visa_sponsor = models.BooleanField(blank=True, null=True)

    salary_min = models.PositiveIntegerField(blank=True, null=True)
    salary_max = models.PositiveIntegerField(blank=True, null=True)

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

    country = ArrayField(models.CharField(max_length=128), default=list, blank=True)
    city = ArrayField(models.CharField(max_length=128), default=list, blank=True)

    url_external = models.CharField(blank=True, max_length=1024, verbose_name="URL")

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

    history = HistoricalRecords()

    graphql_query_for_algolia: str = "JobsByIds"
    graphql_query_for_algolia_field: str = "jobs"

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

    def get_org_json(self):
        return self._get_graphql_field("org") or {}

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
    is_remote = models.BooleanField(blank=True, null=True)
    salary_min = models.PositiveIntegerField(blank=True, null=True)

    is_active = models.BooleanField(default=True)

    sent_count = models.PositiveIntegerField(default=0)
    jobs_clicked_count = models.PositiveIntegerField(default=0)
    jobs_clicked = models.ManyToManyField(Job, blank=True)

    history = HistoricalRecords()
