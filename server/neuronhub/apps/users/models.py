import uuid

from coolname_hash import pseudohash_slug
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.crypto import salted_hmac
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
    email = models.EmailField(unique=True, blank=True)  # overriding super().email(unique=False)

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


class UserAnon(models.Model):
    """
    Used for anonymous tracking (Posthog, Sentry) with deterministic by email `anon_name`.
    """

    anon_name = models.CharField(max_length=128, unique=True)

    #: not needed - drop after ~2026-04-20
    email_hash = models.CharField(max_length=128, unique=True)

    @staticmethod
    async def get_or_create_from_email(email: str) -> "UserAnon":
        email_hash = salted_hmac(key_salt="UserAnon", value=email).hexdigest()
        anon_name = pseudohash_slug(email_hash)
        user_anon, _ = await UserAnon.objects.aget_or_create(
            email_hash=email_hash,
            defaults={"anon_name": anon_name},
        )
        return user_anon

    def __str__(self) -> str:
        return self.anon_name


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
