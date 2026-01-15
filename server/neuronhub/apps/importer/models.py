import uuid

from django.db import models
from django_choices_field import TextChoicesField

from neuronhub.apps.db.models_abstract import TimeStampedModel
from neuronhub.apps.posts.models import Post


class ImportDomain(models.TextChoices):
    HackerNews = "hackernews"


class UserSource(TimeStampedModel):
    id_external = models.CharField(max_length=255)
    username = models.CharField(max_length=255)
    score = models.IntegerField(default=0)
    about = models.TextField(blank=True)
    created_at_external = models.DateTimeField(blank=True, null=True)
    json = models.JSONField(blank=True, help_text="Raw JSON from the import")


class PostSource(TimeStampedModel):
    post = models.OneToOneField(
        Post,
        on_delete=models.CASCADE,
        related_query_name="post_source",
        related_name="post_source",
    )

    domain = TextChoicesField(ImportDomain, blank=True, null=True, default=None)

    id_external = models.CharField(blank=True)
    # todo ? refac-name: hn_rank_derived
    rank = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="As HackerNews hides the Comment scores, we derive it from the Firebase API response order and save in .rank",
    )
    url = models.CharField(max_length=255, blank=True)

    # todo ? refac-name: source_url or similar
    url_of_source = models.CharField(
        max_length=255, blank=True, help_text="Eg a blog url imported from HN"
    )
    source_html_meta = models.TextField(blank=True)

    score = models.PositiveIntegerField(
        null=True, blank=True, help_text="To be integrated with our reputation system"
    )
    json = models.JSONField(blank=True, help_text="Raw JSON from the import")

    user_source = models.ForeignKey(
        UserSource,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="posts",
        related_query_name="post",
    )

    created_at_external = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"PostSource(id={self.id}, score={self.score or self.rank})"


class ApiSource(models.TextChoices):
    HackerNews = "HackerNews"
    Algolia = "Algolia"


class ApiHourlyLimit(TimeStampedModel):
    source = TextChoicesField(ApiSource)

    count_max_per_hour = models.PositiveIntegerField(default=10_000)
    count_current = models.PositiveIntegerField(default=0)

    query_date = models.DateField()
    query_hour = models.PositiveSmallIntegerField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["source", "query_date", "query_hour"],
                name="api_limit_unique_per_hour",
            )
        ]

    def is_limit_exceeded(self) -> bool:
        return self.count_current >= self.count_max_per_hour


class ImportTaskCronAuthToken(TimeStampedModel):
    token = models.CharField(max_length=1024, default=uuid.uuid4)
