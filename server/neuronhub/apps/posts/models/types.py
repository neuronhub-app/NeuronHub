from django.db import models


class PostTypeEnum(models.TextChoices):
    # todo refac: capitalize .value to match GraphQL .value
    Post = "post"
    Tool = "tool"
    Review = "review"
    Comment = "comment"
