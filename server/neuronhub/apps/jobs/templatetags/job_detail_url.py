from typing import TypedDict
from typing import Unpack

from django import template
from django.conf import settings


register = template.Library()


class JobDetailParams(TypedDict):
    slug: str
    alert_id: int


@register.simple_tag()
def job_detail_url(**kwargs: Unpack[JobDetailParams]) -> str:
    return f"{settings.CLIENT_URL}/jobs/{kwargs['slug']}?alert={kwargs['alert_id']}"
