from django.conf import settings
from django.db import models
from django.urls import reverse


class AxonhubModel(models.Model):
    class Meta:
        abstract = True

    @property
    def admin_url(self) -> str:
        return settings.BACKEND_URL + reverse(
            f"admin:{self._meta.app_label}_{self._meta.model_name}_change", args=[self.id]
        )


class TimeStampedModel(AxonhubModel):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
