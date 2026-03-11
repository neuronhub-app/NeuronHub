import datetime
from zoneinfo import ZoneInfo

from django.db import models
from django.utils.timezone import localdate
from django_extensions.db.fields import AutoSlugField
from timezone_field import TimeZoneField

from neuronhub.apps.db.models_abstract import TimeStampedModel
from neuronhub.apps.posts.graphql.types_lazy import TagCategoryEnum


class Org(TimeStampedModel):
    name = models.CharField(max_length=255)
    slug = AutoSlugField(populate_from="name", unique=True)
    domain = models.CharField(max_length=255, blank=True, default="", unique=False)
    tz: ZoneInfo = TimeZoneField(default="America/Los_Angeles")

    website = models.CharField(max_length=1024, blank=True)
    jobs_page_url = models.CharField(max_length=1024, blank=True)
    description = models.TextField(blank=True)
    is_highlighted = models.BooleanField(default=False)
    logo = models.ImageField(upload_to="orgs/logos/", blank=True, null=True)

    tags_area = models.ManyToManyField(  # type: ignore[var-annotated]  #bad-infer
        "posts.PostTag",
        limit_choices_to={"categories__name": TagCategoryEnum.Area},
        related_name=f"tags_org_{TagCategoryEnum.Area.value}",
        blank=True,
    )

    class Meta:
        ordering = ["name"]

    def date_today(self) -> datetime.date:
        return localdate(timezone=self.tz)

    def __str__(self):
        return self.name
