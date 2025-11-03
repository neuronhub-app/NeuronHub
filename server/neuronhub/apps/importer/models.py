from django.db import models
from django_choices_field import TextChoicesField

from neuronhub.apps.db.models_abstract import TimeStampedModel
from neuronhub.apps.posts.models import Post


class ImportDomain(models.TextChoices):
    HackerNews = "hackernews"


class PostSource(TimeStampedModel):
    post = models.OneToOneField(
        Post,
        on_delete=models.CASCADE,
        related_query_name="post_source",
        related_name="post_source",
    )

    domain = TextChoicesField(ImportDomain, blank=True, null=True, default=None)

    id_external = models.CharField(blank=True)
    rank = models.PositiveIntegerField(
        null=True, blank=True, help_text="Eg from HN Firebase API"
    )
    url = models.CharField(max_length=255, blank=True)
    url_of_source = models.CharField(
        max_length=255, blank=True, help_text="Eg a blog url imported from HN"
    )
    score = models.PositiveIntegerField(
        null=True, blank=True, help_text="To be integrated with our reputation system"
    )
    json = models.JSONField(blank=True, help_text="Raw JSON used in the import")

    created_at_external = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"PostSource(id={self.id}, score={self.score or self.rank})"


class UserSource(TimeStampedModel):
    post = models.ForeignKey(
        PostSource,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
        related_query_name="user",
    )

    id_external = models.CharField(max_length=255)
    username = models.CharField(max_length=255)
    score = models.PositiveIntegerField(default=0)

    created_at_external = models.DateTimeField(blank=True, null=True)


class ApiSource(models.TextChoices):
    HackerNews = "HackerNews"
    HackerNewsAlgolia = "HackerNewsAlgolia"


class ApiHourlyLimit(TimeStampedModel):
    source = TextChoicesField(ApiSource)
    count_current = models.PositiveIntegerField(default=0)
    count_max_per_hour = models.PositiveIntegerField(default=10_000)
    query_at_first = models.DateTimeField(auto_now_add=True)
