from __future__ import annotations

from django.db import models


class ReviewTagName(models.TextChoices):
    # general
    value = "value", "Value"
    ease_of_use = "ease_of_use", "Ease of use"
    a_must_have = "a_must_have", "A must have"

    # software
    expectations = "expectations", "Expectations"
    stability = "stability", "Stability"
    controversial = "controversial", "Controversial"
    privacy = "privacy", "Privacy"
    open_source = "open_source", "Open Source"

    # goods
    quality = "quality", "Quality"

    # article
    changed_my_mind = "changed_my_mind", "Changed my mind"
    read_fully = "read_fully", "Read fully"
