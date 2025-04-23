from django.db import models


class Visibility(models.TextChoices):
    """
    Ordered by most to least sensitive.
    """

    PRIVATE = "private"
    USERS_SELECTED = "users_selected"

    # remove
    CONNECTION_GROUPS_SELECTED = "connection_groups_selected"

    CONNECTIONS = "connections"
    SUBSCRIBERS_PAID = "subscribers_paid"
    SUBSCRIBERS = "subscribers"
    INTERNAL = "internal"
    PUBLIC = "public"
