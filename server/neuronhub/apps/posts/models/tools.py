from __future__ import annotations

import logging

from django.core.validators import DomainNameValidator
from django.db import models
from django_countries.fields import CountryField
from django_extensions.db.fields import AutoSlugField
from simple_history.models import HistoricalRecords

from neuronhub.apps.db.fields import MarkdownField
from neuronhub.apps.db.models_abstract import TimeStampedModel

logger = logging.getLogger(__name__)


class ToolCompanyOwnership(TimeStampedModel):
    """
    Private, Public, Non-profit, etc
    """

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class ToolCompany(TimeStampedModel):
    ownership = models.ForeignKey(ToolCompanyOwnership, on_delete=models.SET_NULL, null=True)

    name = models.CharField(max_length=511)
    slug = AutoSlugField(populate_from="name", unique=True)

    description = MarkdownField(blank=True)

    domain = models.CharField(
        validators=[DomainNameValidator(accept_idna=False)],
        blank=True,
        max_length=255,
    )

    country = CountryField(blank=True)

    is_single_product = models.BooleanField(default=False)

    crunchbase_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)

    history = HistoricalRecords(excluded_fields=["slug"])

    def __str__(self):
        return self.name


class PostToolStatsGithub(TimeStampedModel):
    post = models.OneToOneField(
        "posts.Post", on_delete=models.CASCADE, related_name="stats_github"
    )

    stars = models.IntegerField()
    kloc = models.IntegerField(null=True, blank=True)

    forks = models.IntegerField(null=True, blank=True)
    watchers = models.IntegerField(null=True, blank=True)
    issues = models.IntegerField(null=True, blank=True)
    pull_requests = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.post.title
