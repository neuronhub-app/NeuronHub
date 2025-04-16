from __future__ import annotations

from django.contrib.contenttypes.fields import GenericRelation
from django.db import models
from django_extensions.db.fields import AutoSlugField
from neuronhub.apps.comments.models import Comment
from django.db.models import ManyToManyField
from django_choices_field import TextChoicesField

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.anonymizer.registry import AnonimazableTimeStampedModel
from neuronhub.apps.anonymizer.registry import anonymizable_field
from neuronhub.apps.db.fields import MarkdownField
from neuronhub.apps.tools.models import Tool
from neuronhub.apps.users.models import UserConnectionGroup
from neuronhub.apps.anonymizer.registry import anonymizer
from neuronhub.apps.users.models import User


@anonymizer.register
class QuestionPost(AnonimazableTimeStampedModel):
    tool = models.ForeignKey(Tool, on_delete=models.SET_NULL, null=True, blank=True)

    author = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="questions",
        blank=True,
        null=True,
    )

    users_read_later = models.ManyToManyField(
        User,
        related_name="questions_read_later",
        blank=True,
    )
    users_library = models.ManyToManyField(
        User,
        related_name="questions_library",
        blank=True,
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
    visibility = TextChoicesField(choices_enum=Visibility, default=Visibility.PRIVATE)

    comments = GenericRelation(Comment)

    slug = AutoSlugField(populate_from="title", unique=True)
    title = anonymizable_field(
        models.CharField(max_length=511, blank=True),
    )
    content = anonymizable_field(MarkdownField(blank=True))
