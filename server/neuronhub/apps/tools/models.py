from __future__ import annotations

import logging

from django.core.validators import DomainNameValidator
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
    ownership = models.ForeignKey(CompanyOwnership, on_delete=models.SET_NULL, null=True)

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

    history = HistoricalRecords()

    def __str__(self):
        return self.name


@anonymizer.register
class ToolTag(AnonimazableTimeStampedModel):
    tag_parent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tags_children",
    )
    author = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="tags",
        blank=True,
        null=True,
    )

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_important = models.BooleanField(
        default=False,
        help_text="An important Tag is highly informative of its Tool - it's shown before all others and displays an icon",
    )

    class Meta:
        unique_together = ["tag_parent", "name"]

    def __str__(self):
        if self.tag_parent:
            return f"{self.tag_parent} / {self.name}"
        return self.name


class Tool(TimeStampedModel):
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True)
    alternatives = models.ManyToManyField(
        "self",
        through="ToolAlternative",
        symmetrical=False,  # todo ~ clarify
        related_name="alternatives_to",
    )
    tags = models.ManyToManyField(
        ToolTag,
        related_name="tools",
        related_query_name="tool",
        blank=True,
    )

    name = models.CharField(max_length=511)
    slug = AutoSlugField(populate_from="name", unique=True)
    type = models.CharField(max_length=255, help_text="Program, Link, Article, etc")

    description = MarkdownField(blank=True)

    url = models.URLField(blank=True)

    crunchbase_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)

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
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
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
class ToolTagVote(ToolVoteModel):
    tool = models.ForeignKey(Tool, on_delete=models.CASCADE, related_name="votes")
    tag = models.ForeignKey(ToolTag, on_delete=models.CASCADE, related_name="votes")
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
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
    tool = models.ForeignKey(Tool, on_delete=models.PROTECT)

    author = models.ForeignKey(User, on_delete=models.PROTECT, related_name="tools")
    orgs = models.ManyToManyField(Org, related_name="tools", blank=True)

    tool_tags = models.ManyToManyField(ToolTag, related_name="reviews", blank=True)

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
    visibility = TextChoicesField(
        choices_enum=Visibility,
        default=Visibility.PRIVATE,
    )

    source = models.CharField(max_length=255, blank=True)

    # 5 categories: very dissatisfied, dissatisfied, neutral, satisfied, very satisfied
    rating = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
    )
    experience_hours = models.PositiveIntegerField(
        blank=True,
        null=True,
    )
    importance = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
    )

    reviewed_at = anonymizable_field(models.DateTimeField(auto_now_add=True))

    title = anonymizable_field(
        models.CharField(max_length=511, blank=True),
    )
    content = anonymizable_field(MarkdownField(blank=True))
    content_pros = anonymizable_field(MarkdownField(blank=True))
    content_cons = anonymizable_field(MarkdownField(blank=True))
    content_private = anonymizable_field(
        MarkdownField(blank=True, help_text="Visible only to the user"),
    )

    is_review_later = models.BooleanField(default=False)
    is_private = models.BooleanField(default=False)

    # tags = models.ManyToManyField(ToolReviewTag, blank=True)

    usage_status = TextChoicesField(
        choices_enum=UsageStatus,
        default=None,
        blank=True,
        null=True,
    )

    history = HistoricalRecords(cascade_delete_history=True)

    def __str__(self):
        return f"{self.title or self.tool.name} [{self.rating}]"


class ReviewTagName(models.TextChoices):
    # general
    value = "value", "Value"
    ease_of_use = "ease_of_use", "Ease of use"
    a_must = "a_must", "A must"  # todo ~ rename "a_must_have"

    # software
    expectations = "expectations", "Expectations"
    stability = "stability", "Stability"
    controversial = "controversial", "Controversial"
    privacy = "privacy", "Privacy"
    open_source = "open_source", "Open Source"

    # goods
    quality = "quality", "Quality"

    # article
    changed_my_mind = "changed_my_mind", "Changed my mind"
    read_fully = "read_fully", "Read fully"


class ToolReviewTag(TimeStampedModel):
    review = models.ForeignKey(
        ToolReview,
        on_delete=models.CASCADE,
        related_name="tags",
        blank=True,
        null=True,
    )
    name = TextChoicesField(choices_enum=ReviewTagName)
    is_vote_positive = models.BooleanField(null=True, blank=True)

    class Meta:
        unique_together = ["review", "name"]

    def __str__(self):
        return self.name
