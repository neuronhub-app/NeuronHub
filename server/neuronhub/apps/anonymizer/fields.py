from __future__ import annotations

from django.db import models


class Visibility(models.TextChoices):
    PRIVATE = "private"
    USERS_SELECTED = "users_selected"
    CONNECTION_GROUPS = "connection_groups"  # todo ~ rename CONNECTIONS_GROUPS_SELECTED
    CONNECTIONS = "connections"  # todo ~ rename CONNECTIONS_ALL
    INTERNAL = "internal"
    PUBLIC = "public"
