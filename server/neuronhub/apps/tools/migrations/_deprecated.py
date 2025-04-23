from __future__ import annotations

from django.db import models


class Importance(models.TextChoices):
    EXTRA_LOW = "extra_low"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    EXTRA_HIGH = "extra_high"
