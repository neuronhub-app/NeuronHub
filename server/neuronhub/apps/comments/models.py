from __future__ import annotations
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.db.models import ManyToManyField
from django_choices_field import TextChoicesField

from neuronhub.apps.anonymizer.registry import AnonimazableTimeStampedModel
from neuronhub.apps.anonymizer.registry import anonymizable_field
from neuronhub.apps.anonymizer.registry import anonymizer
from neuronhub.apps.db.fields import MarkdownField
from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.users.models import User
from neuronhub.apps.users.models import UserConnectionGroup


@anonymizer.register
class Comment(AnonimazableTimeStampedModel):
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    content_object = GenericForeignKey("content_type", "object_id")
    object_id = models.PositiveIntegerField()

    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        related_name="replies",
        null=True,
        blank=True,
    )

    visibility = TextChoicesField(choices_enum=Visibility, default=Visibility.PRIVATE)
    visible_to_users: ManyToManyField[User] = anonymizable_field(
        models.ManyToManyField(
            User,
            related_name="comments_visible",
            blank=True,
        ),
    )
    visible_to_groups: ManyToManyField[UserConnectionGroup] = anonymizable_field(
        models.ManyToManyField(
            UserConnectionGroup,
            related_name="comments_visible",
            blank=True,
        ),
    )

    author = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="comments",
        null=True,
    )

    seen_by_users = models.ManyToManyField(
        User,
        related_name="comments_seen",
        blank=True,
        help_text="Marked 'seen' if present in browser's ViewBox for 4 seconds",
    )

    content = anonymizable_field(MarkdownField(blank=True))

    class Meta:
        indexes = [
            models.Index(fields=["content_type", "object_id"]),
        ]


@anonymizer.register
class CommentVote(AnonimazableTimeStampedModel):
    comment = models.ForeignKey(
        Comment,
        on_delete=models.CASCADE,
        related_name="votes",
    )
    author = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="comment_votes",
        null=True,
    )
    is_vote_positive = models.BooleanField(null=True, blank=True)
    is_vote_changed_my_mind = models.BooleanField(default=False)

    class Meta:
        unique_together = ["comment", "author"]
