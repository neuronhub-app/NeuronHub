from django.db import models


class PostTypeEnum(models.TextChoices):
    Post = "post"
    Tool = "tool"
    Review = "review"
    Comment = "comment"
