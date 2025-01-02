import datetime
from zoneinfo import ZoneInfo

from django.db import models
from django.utils.timezone import localdate
from django_extensions.db.fields import AutoSlugField
from timezone_field import TimeZoneField

from neuronhub.apps.db.models_abstract import TimeStampedModel


class Org(TimeStampedModel):
    name = models.CharField(max_length=255)
    slug = AutoSlugField(populate_from="name", unique=True)
    domain = models.CharField(max_length=255, blank=False, unique=True)
    tz: ZoneInfo = TimeZoneField(default="America/Los_Angeles")

    class Meta:
        ordering = ["name"]

    def date_today(self) -> datetime.date:
        return localdate(timezone=self.tz)

    def __str__(self):
        return self.name
