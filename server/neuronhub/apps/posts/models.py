from __future__ import annotations

from django.contrib.contenttypes.fields import GenericRelation
from django.db import models
from django_extensions.db.fields import AutoSlugField
from simple_history.models import HistoricalRecords

from neuronhub.apps.comments.models import Comment
from django.db.models import ManyToManyField
from django_choices_field import TextChoicesField

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.anonymizer.registry import AnonimazableTimeStampedModel
from neuronhub.apps.anonymizer.registry import anonymizable_field
from neuronhub.apps.db.fields import MarkdownField
from neuronhub.apps.tools.models import Tool
from neuronhub.apps.tools.models import ToolTag
from neuronhub.apps.tools.models import ToolVoteModel
from neuronhub.apps.users.models import UserConnectionGroup
from neuronhub.apps.anonymizer.registry import anonymizer
from neuronhub.apps.users.models import User


@anonymizer.register
class Post(AnonimazableTimeStampedModel):
    tool = models.ForeignKey(Tool, on_delete=models.SET_NULL, null=True, blank=True)

    author = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="posts",
        blank=True,
        null=True,
    )
    tags = models.ManyToManyField(ToolTag, related_name="posts", blank=True)

    users_read_later = models.ManyToManyField(
        User,
        related_name="posts_read_later",
        blank=True,
    )
    users_library = models.ManyToManyField(
        User,
        related_name="posts_library",
        blank=True,
    )

    visible_to_users: ManyToManyField[User] = anonymizable_field(
        models.ManyToManyField(
            User,
            related_name="posts_visible",
            blank=True,
        ),
    )
    visible_to_groups: ManyToManyField[UserConnectionGroup] = anonymizable_field(
        models.ManyToManyField(
            UserConnectionGroup,
            related_name="posts_visible",
            blank=True,
        ),
    )
    visibility = TextChoicesField(choices_enum=Visibility, default=Visibility.PRIVATE)

    comments = GenericRelation(Comment)

    slug = AutoSlugField(populate_from="title", unique=True)
    title = anonymizable_field(
        models.CharField(max_length=140),
    )
    content = anonymizable_field(MarkdownField(blank=True))

    history = HistoricalRecords(cascade_delete_history=True)

    def __str__(self):
        return f"{self.title}"


@anonymizer.register
class PostVote(AnonimazableTimeStampedModel):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="votes")
    author = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="post_votes"
    )
    is_vote_positive = models.BooleanField(null=True, blank=True)

    class Meta:
        unique_together = ["post", "author"]

    def __str__(self):
        return f"{self.post} - {self.author} [{self.is_vote_positive}]"


@anonymizer.register
class PostTagVote(ToolVoteModel):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="tag_votes")
    tag = models.ForeignKey(ToolTag, on_delete=models.CASCADE, related_name="post_votes")
    author = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="post_tag_votes"
    )
    is_vote_positive = models.BooleanField(null=True, blank=True)

    class Meta:
        unique_together = ["post", "tag", "author"]

    def __str__(self):
        return f"{self.post} - {self.tag} [{self.is_vote_positive}]"
