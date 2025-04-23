from __future__ import annotations

from django.db import models
from django_choices_field import TextChoicesField

from neuronhub.apps.db.models_abstract import TimeStampedModel
from neuronhub.apps.posts.models.posts import Post


class ReviewTagName(models.TextChoices):
    # general
    value = "value", "Value"
    ease_of_use = "ease_of_use", "Ease of use"
    a_must_have = "a_must_have", "A must have"

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


class PostReviewTag(TimeStampedModel):
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="review_tags",
        blank=True,
        null=True,
    )
    name: ReviewTagName = TextChoicesField(choices_enum=ReviewTagName)
    is_vote_positive: bool = models.BooleanField(null=True, blank=True)

    class Meta:
        unique_together = ["post", "name"]

    def __str__(self):
        return self.name
