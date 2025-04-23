from __future__ import annotations


from django.db import models
from django.db.models import CharField
from django.utils import timezone
from django_choices_field import TextChoicesField
from django_extensions.db.fields import AutoSlugField
from simple_history.models import HistoricalRecords

from django.db.models import ManyToManyField

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.anonymizer.registry import AnonimazableTimeStampedModel
from neuronhub.apps.anonymizer.registry import anonymizable
from neuronhub.apps.anonymizer.registry import anonymizer
from neuronhub.apps.db.fields import MarkdownField
from neuronhub.apps.posts.models.tools import ToolCompany
from neuronhub.apps.posts.models.types import PostTypeEnum
from neuronhub.apps.users.graphql.types_lazy import UserListName
from neuronhub.apps.users.models import User
from neuronhub.apps.users.models import UserConnectionGroup


class UsageStatus(models.TextChoices):
    USING = "using"
    USED = "used"
    WANT_TO_USE = "want_to_use", "Want to use"
    INTERESTED = "interested"
    NOT_INTERESTED = "not_interested", "Not interested"


class PostManagerAbstract(models.Manager["Post"]):
    type = PostTypeEnum.Post

    def get_queryset(self) -> models.QuerySet[Post]:
        return super().get_queryset().filter(type=self.type)


class PostManager(PostManagerAbstract):
    type = PostTypeEnum.Post


class ToolManager(PostManagerAbstract):
    type = PostTypeEnum.Tool


class ReviewManager(PostManagerAbstract):
    type = PostTypeEnum.Review


class CommentManager(PostManagerAbstract):
    type = PostTypeEnum.Comment


@anonymizer.register
class Post(AnonimazableTimeStampedModel):
    objects = models.Manager()
    posts = PostManager()
    tools = ToolManager()
    reviews = ReviewManager()
    comments = CommentManager()

    Type = PostTypeEnum
    type = TextChoicesField(Type, default=Type.Post)

    parent = models.ForeignKey(
        "self",
        blank=True,
        null=True,
        on_delete=models.SET_NULL,
        help_text="Can link to a PostTool (type=review), PostReview (type=comment), PostComment (type=comment)",
        related_name="children",
    )

    alternatives = models.ManyToManyField(
        "self",
        through="PostRelated",
        symmetrical=False,  # todo ~ clarify why
        related_name="alternatives_to",
    )

    tags = ManyToManyField("PostTag", related_name="posts", blank=True)

    author = models.ForeignKey(User, blank=True, null=True, on_delete=models.SET_NULL)

    users_read_later = models.ManyToManyField(
        User, related_name=UserListName.read_later.value, blank=True
    )
    users_library = models.ManyToManyField(
        User, related_name=UserListName.library.value, blank=True
    )
    seen_by_users = models.ManyToManyField(
        User,
        related_name="posts_seen",
        blank=True,
        help_text="Marked 'seen' if present in browser's ViewBox for ~4 seconds",
    )

    history = HistoricalRecords(cascade_delete_history=True)

    # permissions
    # ---------------------

    recommended_to_users = anonymizable(
        models.ManyToManyField(User, related_name="posts_recommended", blank=True),
    )
    recommended_to_groups = anonymizable(
        models.ManyToManyField(
            UserConnectionGroup, related_name="posts_recommended", blank=True
        ),
    )
    visible_to_users = anonymizable(
        models.ManyToManyField(User, related_name="posts_visible", blank=True),
    )
    visible_to_groups = anonymizable(
        models.ManyToManyField(UserConnectionGroup, related_name="posts_visible", blank=True),
    )
    visibility = TextChoicesField(Visibility, default=Visibility.PRIVATE)

    # content
    # ---------------------

    slug = AutoSlugField(populate_from="title", unique=True)
    title = anonymizable(models.CharField(max_length=140))
    content = anonymizable(MarkdownField(blank=True))
    content_private = anonymizable(MarkdownField(blank=True, help_text="Only for author"))
    source = CharField(max_length=140, blank=True)

    # tool fields
    # ---------------------

    class ToolType(models.TextChoices):
        Program = "program"
        Material = "material"
        SaaS = "saas"
        App = "app"
        Other = "other"

    company = models.ForeignKey(ToolCompany, on_delete=models.SET_NULL, null=True, blank=True)
    tool_type = TextChoicesField(ToolType, blank=True, null=True, default=None)
    domain = models.CharField(max_length=140, blank=True)
    url = models.URLField(blank=True)
    crunchbase_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)

    # review fields
    # ---------------------

    review_content_pros = anonymizable(MarkdownField(blank=True))
    review_content_cons = anonymizable(MarkdownField(blank=True))
    review_rating = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
        help_text="Split on 5 categories: very dissatisfied, dissatisfied, neutral, satisfied, very satisfied",
    )
    review_experience_hours = models.PositiveIntegerField(blank=True, null=True)
    review_importance = models.DecimalField(
        max_digits=5, decimal_places=2, blank=True, null=True
    )
    review_usage_status = TextChoicesField(
        UsageStatus,
        default=None,
        blank=True,
        null=True,
    )
    reviewed_at = anonymizable(models.DateTimeField(default=timezone.now))

    def __str__(self):
        match self.type:
            case Post.Type.Post | Post.Type.Tool:
                return f"[{self.type}] {self.title}"
            case Post.Type.Review:
                return f"[{self.type}] {self.title} [{self.review_rating}]"
            case Post.Type.Comment:
                return f"[{self.type}] {self.title}"

        return f"{self.title}"


@anonymizer.register
class PostVote(AnonimazableTimeStampedModel):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="votes")
    author = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="post_votes"
    )
    is_vote_positive = models.BooleanField(null=True, blank=True)
    is_changed_my_mind = models.BooleanField(null=True, blank=True)

    class Meta:
        unique_together = ["post", "author"]

    def __str__(self):
        return f"{self.post} - {self.author} [{self.is_vote_positive}]"


class PostTag(AnonimazableTimeStampedModel):
    tag_parent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
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

    class Meta:
        unique_together = ["tag_parent", "name"]

    def __str__(self):
        if self.tag_parent:
            return f"{self.tag_parent} / {self.name}"
        return self.name


@anonymizer.register
class PostTagVote(AnonimazableTimeStampedModel):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="tag_votes")
    tag = models.ForeignKey(PostTag, on_delete=models.CASCADE, related_name="post_votes")
    author = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="post_tag_votes"
    )

    is_vote_positive = models.BooleanField(null=True, blank=True)
    is_changed_my_mind = models.BooleanField(default=False)
    is_important = models.BooleanField(
        default=False,
        help_text="An important Tag is highly informative of its Tool - it's shown before all others and displays an "
        "icon",
        null=True,
        blank=True,
    )

    class Meta:
        unique_together = ["post", "tag", "author"]

    def __str__(self):
        return f"{self.post} - {self.tag} [{self.is_vote_positive}]"


@anonymizer.register
class PostRelated(AnonimazableTimeStampedModel):
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    post = models.ForeignKey(
        "Post",
        on_delete=models.CASCADE,
        related_name="posts_related",
        related_query_name="post_related",
    )
    post_related = models.ForeignKey(
        "Post",
        on_delete=models.CASCADE,
        related_name="posts_related_to",
        related_query_name="post_related_to",
    )

    is_vote_positive = models.BooleanField(null=True, blank=True)
    comment = anonymizable(MarkdownField(blank=True))

    def __str__(self):
        return (
            f"{self.post} - {self.post_related} [pos={self.is_vote_positive.__str__().lower()}]"
        )
