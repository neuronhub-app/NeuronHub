from django.conf import settings
from django.db import models
from django.db.models import Model
from django.urls import reverse


class NeuronModel(Model):
    class Meta:
        abstract = True

    @property
    def admin_url(self) -> str:
        return settings.BACKEND_URL + reverse(
            f"admin:{self.attr_meta.app_label}_{self.attr_meta.model_name}_change",
            args=[self.id],
        )


class TimeStampedModel(NeuronModel):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
