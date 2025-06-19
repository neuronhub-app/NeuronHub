from __future__ import annotations

from django.conf import settings
from django.db import models
from django.db.models import Model
from django.urls import reverse


class NeuronModel(Model):
    id: int  # for mypy

    class Meta:
        abstract = True

    @property
    def admin_url(self) -> str:
        return settings.SERVER_URL + reverse(
            f"admin:{self._meta.app_label}_{self._meta.model_name}_change",
            args=[self.id],
        )


class TimeStampedModel(NeuronModel):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
