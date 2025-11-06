"""
Framework for anonymizing registered Django models, that have an `author` field + timestamps + extra.

Process:
- randomize timestamps by few days (to prevent correlation back to the author)
- set `author` to the "Anonym" User instance
- erase HistoricalRecords if any
- erase text content if needed

Potential issues:
- forgetting to handle new fields and relationships
  - for relationships - mitigate by centralizing by an App, not a Model
  - for new fields - handle them in Model's anonymize() method
- todo[?](auth) assert all Models with an `author/user` field are registered
"""

import random
from datetime import datetime
from datetime import timedelta

from django.conf import settings
from django.db import models
from django.db.models import Field
from simple_history.models import HistoricalRecords

from neuronhub.apps.db.models_abstract import TimeStampedModel
from neuronhub.apps.users.models import User


async def anonymize_user_data(
    user: User,
    is_delete_user: bool = False,
    is_erase_text_content: bool = False,
):
    user_anon, _ = await User.objects.aget_or_create(
        email=f"anon@{settings.DOMAIN_NAME}",
        first_name="Anonym",
    )
    for model_anonymizable in anonymizer.models:
        # All registered models have an author field, but mypy can't see it on the abstract base
        instances = list(model_anonymizable._default_manager.filter(author=user))  # type: ignore[misc]
        for instance in instances:
            instance.anonymize(user_anon, is_erase_text_content)
        if instances:
            await model_anonymizable._default_manager.abulk_update(
                instances,
                model_anonymizable.get_anonymizable_fields(),
            )

    if is_delete_user:
        await user.adelete()


class AnonymizerRegistry:
    models: list[type[AnonimazableTimeStampedModel]] = []

    # generic limiter prb breaks pycharm stubs, but adds mypy more useful checks
    def register[M: AnonimazableTimeStampedModel](self, cls: type[M]) -> type[M]:
        assert issubclass(cls, AnonimazableTimeStampedModel)
        self.models.append(cls)
        return cls


anonymizer = AnonymizerRegistry()


is_anonymizable_attr_name = "_is_anonymizable_field"


def anonymizable[F: Field](field: F) -> F:
    """
    Helps to avoid forgetting to mark all anonymizable fields
    """
    setattr(field, is_anonymizable_attr_name, True)
    return field


class AnonimazableTimeStampedModel(TimeStampedModel):
    created_at = anonymizable(models.DateTimeField(auto_now_add=True))
    updated_at = anonymizable(models.DateTimeField(auto_now=True))

    author: User | None
    history: HistoricalRecords | None = None

    class Meta:
        abstract = True

    @classmethod
    def get_anonymizable_fields(cls):
        return [
            field.name
            for field in cls._meta.get_fields()
            if getattr(field, is_anonymizable_attr_name, False)
        ]

    def anonymize(
        self,
        user_anon: User,
        is_erase_text_content: bool = False,
    ) -> AnonimazableTimeStampedModel:
        self.author = user_anon

        self.created_at = self._anonymize_datetime(self.created_at)
        self.updated_at = self._anonymize_datetime(self.updated_at, is_future_only=True)

        # todo[!](auth) reset all anonymizable fields, confirm rels are reset, test
        # todo[!](auth) respect is_erase_text_content

        if self.history:
            self.history.history_manager.all().delete()

        return self

    def _anonymize_datetime(self, dt_base: datetime, is_future_only: bool = False):
        max_days_diff = 5

        if is_future_only:
            days_offset = random.randint(0, max_days_diff)
        else:
            days_offset = random.randint(-max_days_diff, max_days_diff)

        dt_new = dt_base + timedelta(days=days_offset)
        return dt_new.replace(
            hour=random.randint(0, 23),
            minute=random.randint(0, 59),
            second=random.randint(0, 59),
        )
