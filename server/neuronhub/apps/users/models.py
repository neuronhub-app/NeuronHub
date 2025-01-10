from django.contrib.auth.models import AbstractUser
from django.db import models
from strawberry_django.descriptors import model_property

from neuronhub.apps.orgs.models import Org


class User(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(blank=True, max_length=255)
    last_name = models.CharField(blank=True, max_length=255)

    avatar = models.FileField(
        upload_to="avatars/",
        blank=True,
        null=True,
    )

    owner = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text="Owner of this User (Alias) account.",
    )
    org = models.ForeignKey(
        Org,
        on_delete=models.SET_NULL,
        related_name="users",
        null=True,
        blank=True,
    )

    username = None
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    @model_property(cached=True)
    def name(self) -> str:
        if self.first_name or self.last_name:
            return f"{self.first_name} {self.last_name}".strip()
        return self.email

    def __str__(self) -> str:
        return str(self.email)


class UserConnectionGroup(models.Model):
    name = models.CharField(max_length=255, blank=True)
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
