from django.core.validators import DomainNameValidator
from django.db import models
from django_extensions.db.fields import AutoSlugField
from simple_history.models import HistoricalRecords

from axonhub.apps.db.fields import MarkdownField
from axonhub.apps.db.models_abstract import TimeStampedModel
from axonhub.apps.orgs.models import Org
from axonhub.apps.users.models import User


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

    def __str__(self):
        return self.name


class ToolTagVote(ToolVoteModel):
    tool = models.ForeignKey(Tool, on_delete=models.CASCADE)
    tag = models.ForeignKey(ToolTag, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = MarkdownField(blank=True)

    def __str__(self):
        return f"{self.tool} - {self.tag} [{self.is_vote_positive}]"


class ToolReview(TimeStampedModel):
    tool = models.ForeignKey(Tool, on_delete=models.CASCADE)

    orgs = models.ManyToManyField(Org, related_name="tools")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tools")

    reviewed_at = models.DateTimeField(auto_now_add=True)

    rating = models.DecimalField(max_digits=3, decimal_places=2)
    rating_custom = models.JSONField(blank=True)

    title = models.CharField(max_length=511, blank=True)

    content = MarkdownField(blank=True)
    content_personal = MarkdownField(blank=True, help_text="Visible only to the user")

    is_private = models.BooleanField(default=False)

    history = HistoricalRecords(inherit=True)

    def __str__(self):
        return f"{self.title or self.tool.name} [{self.rating}]"
