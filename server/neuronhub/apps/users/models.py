import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models
from strawberry_django.descriptors import model_property

from neuronhub.apps.orgs.models import Org


class User(AbstractUser):
    #: (atm not implemented)
    #: Non-public for privacy, only admins can see it. May be used in anonymization or as a `hash(id_uuid, secret)` in user exports.
    #: End users may only see `username`s through API, not `.id` or `.id_uuid`.
    id_uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    owner = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,  # cascade for privacy, warn is in UI
        null=True,
        blank=True,
        help_text="Owner of this User (Alias), if any",
        related_name="aliases",
        related_query_name="alias",
    )
    org = models.ForeignKey(
        Org,
        on_delete=models.SET_NULL,
        related_name="users",
        null=True,
        blank=True,
    )
    email = models.EmailField(unique=True, blank=True)  # override unique=False

    avatar = models.FileField(
        upload_to="avatars/",
        blank=True,
        null=True,
    )

    @model_property(cached=True)
    def name(self) -> str:
        if self.first_name or self.last_name:
            return f"{self.first_name} {self.last_name}".strip()
        return self.username

    def __str__(self) -> str:
        return str(self.username)


# todo refac: rename to UserCircle, and move out `connections` as a M2M field on User, then drop `NAME_DEFAULT`.
class UserConnectionGroup(models.Model):
    name = models.CharField(max_length=255, blank=True)

    # todo refac: rename to author (or owner?)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="connection_groups",
        related_query_name="connection_group",
        help_text="Author of the Group",
    )
    connections = models.ManyToManyField(
        User,
        related_name="connection_groups_reverse",
        related_query_name="connection_group_reverse",
    )

    NAME_DEFAULT = "Connections"
