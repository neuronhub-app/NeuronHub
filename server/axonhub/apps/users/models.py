from django.contrib.auth.models import AbstractUser
from django.db import models

from axonhub.apps.orgs.models import Org


class User(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(blank=True, max_length=255)
    last_name = models.CharField(blank=True, max_length=255)

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

    def __str__(self) -> str:
        return str(self.email)
