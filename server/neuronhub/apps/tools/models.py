from django.core.validators import DomainNameValidator
from django.db import models
from django_choices_field import TextChoicesField
from django_extensions.db.fields import AutoSlugField
from simple_history.models import HistoricalRecords

from neuronhub.apps.db.fields import MarkdownField
from neuronhub.apps.db.models_abstract import TimeStampedModel
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.users.models import User


class Tool(TimeStampedModel):
    name = models.CharField(max_length=511)
    slug = AutoSlugField(populate_from="name", unique=True)

    description = MarkdownField(blank=True)

    domain = models.CharField(
        validators=[DomainNameValidator(accept_idna=False)],
        blank=True,
        max_length=255,
    )

    crunchbase_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)

    alternatives = models.ManyToManyField(
        "self",
        through="ToolAlternative",
        symmetrical=False,
        related_name="alternatives_to",
    )

    history = HistoricalRecords(inherit=True)

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


class ToolVoteModel(TimeStampedModel):
    is_vote_positive = models.BooleanField()

    class Meta:
        abstract = True


class ToolAlternative(ToolVoteModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

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


class ToolTag(TimeStampedModel):
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

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tags")

    class Meta:
        unique_together = ["tag_parent", "name"]

    def __str__(self):
        return self.name


class ToolTagVote(ToolVoteModel):
    tool = models.ForeignKey(Tool, on_delete=models.CASCADE)
    tag = models.ForeignKey(ToolTag, on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = MarkdownField(blank=True)
    is_vote_positive = models.BooleanField(null=True, blank=True)

    def __str__(self):
        return f"{self.tool} - {self.tag} [{self.is_vote_positive}]"


class UsageStatus(models.TextChoices):
    USING = "using"
    USED = "used"
    WANT_TO_USE = "want_to_use", "Want to use"
    INTERESTED = "interested"
    NOT_INTERESTED = "not_interested", "Not interested"


class ToolReview(TimeStampedModel):
    tool = models.ForeignKey(Tool, on_delete=models.CASCADE)

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tools")
    orgs = models.ManyToManyField(Org, related_name="tools", blank=True)

    source = models.CharField(max_length=255, blank=True)

    is_review_later = models.BooleanField(default=False)
    usage_status = TextChoicesField(
        choices_enum=UsageStatus,
        default=None,
        blank=True,
        null=True,
    )

    reviewed_at = models.DateTimeField(auto_now_add=True)

    rating = models.DecimalField(max_digits=3, decimal_places=2)  # todo PositiveInteger
    rating_custom = models.JSONField(blank=True, null=True)

    title = models.CharField(max_length=511, blank=True)

    content = MarkdownField(blank=True)
    content_private = MarkdownField(blank=True, help_text="Visible only to the user")

    is_private = models.BooleanField(default=False)

    tags = models.ManyToManyField(ToolTag, related_name="reviews", blank=True)

    history = HistoricalRecords(inherit=True)

    def __str__(self):
        return f"{self.title or self.tool.name} [{self.rating}]"
