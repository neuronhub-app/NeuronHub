from django.contrib.postgres.fields import ArrayField
from django.db import models
from simple_history.models import HistoricalRecords

from neuronhub.apps.algolia.models_abstract import AlgoliaModel
from neuronhub.apps.anonymizer.registry import anonymizable
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

    org = models.CharField(max_length=512, blank=True)

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

    def get_tags_json_skill(self):
        return self._get_graphql_field("tags_skill") or []

    def get_tags_json_area(self):
        return self._get_graphql_field("tags_area") or []

    def get_tags_json_education(self):
        return self._get_graphql_field("tags_education") or []

    def get_tags_json_experience(self):
        return self._get_graphql_field("tags_experience") or []

    def get_tags_json_workload(self):
        return self._get_graphql_field("tags_workload") or []

    def __str__(self):
        return f"{self.title} | {self.org}"
