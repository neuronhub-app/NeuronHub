from warnings import deprecated

from django.db import models


class Visibility(models.TextChoices):
    """
    Attributes are ordered as: least sensitive to most.
    """

    PRIVATE = "private"
    USERS_SELECTED = "users_selected"
    CONNECTIONS = "connections"
    SUBSCRIBERS_PAID = "subscribers_paid"
    SUBSCRIBERS = "subscribers"
    INTERNAL = "internal"
    PUBLIC = "public"

    @property
    @deprecated("Use .CONNECTIONS")
    def CONNECTION_GROUPS_SELECTED(self):
        return self.CONNECTIONS
