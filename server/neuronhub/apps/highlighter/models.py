from django.db import models

from neuronhub.apps.db.models_abstract import TimeStampedModel
from neuronhub.apps.posts.models import Post
from neuronhub.apps.users.models import User


class PostHighlight(TimeStampedModel):
    post = models.ForeignKey(
        Post,
        on_delete=models.SET_NULL,
        null=True,
        related_query_name="post_highlight",
        related_name="post_highlights",
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    text_prefix = models.CharField(max_length=64, blank=True, help_text="for position matcher")
    text = models.CharField(max_length=2048)
    text_postfix = models.CharField(max_length=64, blank=True, help_text="for position matcher")

    def __str__(self) -> str:
        return self.text[:30]
