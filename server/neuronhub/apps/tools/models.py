from __future__ import annotations

import logging

from django.core.validators import DomainNameValidator
from django.core.validators import MaxValueValidator
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import ManyToManyField
from django_choices_field import TextChoicesField
from django_countries.fields import CountryField
from django_extensions.db.fields import AutoSlugField
from simple_history.models import HistoricalRecords

from neuronhub.apps.anonymizer.registry import AnonimazableTimeStampedModel
from neuronhub.apps.anonymizer.registry import anonymizable_field
from neuronhub.apps.anonymizer.registry import anonymizer
from neuronhub.apps.db.fields import MarkdownField
from neuronhub.apps.db.models_abstract import TimeStampedModel
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.users.models import User
from neuronhub.apps.users.models import UserConnectionGroup


logger = logging.getLogger(__name__)


class CompanyOwnership(TimeStampedModel):
    """
    Private, Public, Non-profit, etc
    """

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Company(TimeStampedModel):
    name = models.CharField(max_length=511)
    slug = AutoSlugField(populate_from="name", unique=True)

    description = MarkdownField(blank=True)

    domain = models.CharField(
        validators=[DomainNameValidator(accept_idna=False)],
        blank=True,
        max_length=255,
    )

    country = CountryField(blank=True)

    ownership = models.ForeignKey(CompanyOwnership, on_delete=models.PROTECT)

    is_single_product = models.BooleanField(default=False)

    crunchbase_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)

    history = HistoricalRecords()

    def __str__(self):
        return self.name


class Tool(TimeStampedModel):
    name = models.CharField(max_length=511)
    slug = AutoSlugField(populate_from="name", unique=True)
    type = models.CharField(max_length=255, help_text="Program, Link, Article, etc")

    description = MarkdownField(blank=True)

    company = models.ForeignKey(Company, on_delete=models.CASCADE, null=True, blank=True)

    url = models.URLField(blank=True)

    crunchbase_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)

    alternatives = models.ManyToManyField(
        "self",
        through="ToolAlternative",
        symmetrical=False,
        related_name="alternatives_to",
    )

    history = HistoricalRecords()

    class Meta:
        unique_together = ["name", "company"]

    def __str__(self):
        return self.name


class ToolStatsGithub(TimeStampedModel):
    tool = models.OneToOneField(Tool, on_delete=models.CASCADE, related_name="stats_github")

    stars = models.IntegerField()
    kloc = models.IntegerField(null=True, blank=True)

    forks = models.IntegerField(null=True, blank=True)
    watchers = models.IntegerField(null=True, blank=True)
    issues = models.IntegerField(null=True, blank=True)
    pull_requests = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.tool.name


@anonymizer.register
class ToolVoteModel(AnonimazableTimeStampedModel):
    is_vote_positive = models.BooleanField(null=True, blank=True)
    comment = anonymizable_field(MarkdownField(blank=True))
    author: User

    class Meta:
        abstract = True


@anonymizer.register
class ToolAlternative(ToolVoteModel):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    tool = models.ForeignKey(
        Tool,
        on_delete=models.CASCADE,
        related_name="tool_alternatives",
        related_query_name="tool_alternative",
    )
    tool_alternative = models.ForeignKey(
        Tool,
        on_delete=models.CASCADE,
        related_name="tool_alternatives_to",
        related_query_name="tool_alternative_to",
    )

    def __str__(self):
        return f"{self.tool} - {self.tool_alternative} [pos={self.is_vote_positive.__str__().lower()}]"


@anonymizer.register
class ToolTag(AnonimazableTimeStampedModel):
    tools = models.ManyToManyField(Tool, related_name="tags", blank=True)

    tag_parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="tags_children",
    )

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="tags",
        blank=True,
        null=True,
    )

    class Meta:
        unique_together = ["tag_parent", "name"]

    def __str__(self):
        return self.name


@anonymizer.register
class ToolTagVote(ToolVoteModel):
    tool = models.ForeignKey(Tool, on_delete=models.CASCADE)
    tag = models.ForeignKey(ToolTag, on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    is_vote_positive = models.BooleanField(null=True, blank=True)

    class Meta:
        unique_together = ["tool", "tag", "author"]

    def __str__(self):
        return f"{self.tool} - {self.tag} [{self.is_vote_positive}]"


class UsageStatus(models.TextChoices):
    USING = "using"
    USED = "used"
    WANT_TO_USE = "want_to_use", "Want to use"
    INTERESTED = "interested"
    NOT_INTERESTED = "not_interested", "Not interested"


class Visibility(models.TextChoices):
    PRIVATE = "private"
    CONNECTION_GROUPS = "connection_groups"
    CONNECTIONS = "connections"
    INTERNAL = "internal"
    PUBLIC = "public"


class Importance(models.TextChoices):
    EXTRA_LOW = "extra_low"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    EXTRA_HIGH = "extra_high"


@anonymizer.register
class ToolReview(AnonimazableTimeStampedModel):
    tool = models.ForeignKey(Tool, on_delete=models.CASCADE)

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tools")
    orgs = models.ManyToManyField(Org, related_name="tools", blank=True)

    source = models.CharField(max_length=255, blank=True)

    rating = models.PositiveIntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )

    reviewed_at = anonymizable_field(models.DateTimeField(auto_now_add=True))

    rating_trust = models.PositiveIntegerField(
        blank=True,
        null=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
    )
    rating_custom = models.JSONField(blank=True, null=True)

    title = anonymizable_field(
        models.CharField(max_length=511, blank=True),
    )
    content = anonymizable_field(
        MarkdownField(blank=True),
    )
    content_private = anonymizable_field(
        MarkdownField(blank=True, help_text="Visible only to the user"),
    )

    is_review_later = models.BooleanField(default=False)
    is_private = models.BooleanField(default=False)

    tags = models.ManyToManyField(ToolTag, related_name="reviews", blank=True)

    importance = TextChoicesField(
        choices_enum=Importance,
        default=None,
        blank=True,
        null=True,
    )
    usage_status = TextChoicesField(
        choices_enum=UsageStatus,
        default=None,
        blank=True,
        null=True,
    )
    visibility = TextChoicesField(
        choices_enum=Visibility,
        default=Visibility.PRIVATE,
    )
    visible_to_users: ManyToManyField[User] = anonymizable_field(
        models.ManyToManyField(
            User,
            related_name="tools_visible",
            blank=True,
        ),
    )
    visible_to_groups: ManyToManyField[UserConnectionGroup] = anonymizable_field(
        models.ManyToManyField(
            UserConnectionGroup,
            related_name="tools_visible",
            blank=True,
        ),
    )

    recommended_to_users: ManyToManyField[User] = anonymizable_field(
        models.ManyToManyField(
            User,
            related_name="tools_recommended",
            blank=True,
        ),
    )
    recommended_to_groups: ManyToManyField[UserConnectionGroup] = anonymizable_field(
        models.ManyToManyField(
            UserConnectionGroup,
            related_name="tools_recommended",
            blank=True,
        ),
    )

    history = HistoricalRecords(cascade_delete_history=True)

    def __str__(self):
        return f"{self.title or self.tool.name} [{self.rating}]"
