"""
todo refac: api limit should be a class or namespace
"""

import asyncio
import re
from datetime import timedelta
from json import JSONDecodeError
from typing import Any

import requests
from asgiref.sync import sync_to_async
from django.core.cache import cache
from django.db.models import F
from django.utils import timezone

from neuronhub.apps.importer.models import ApiHourlyLimit
from neuronhub.apps.importer.models import ApiSource


async def request_json(
    url: str, is_use_cache: bool = False, cache_expiry_days: int | None = None
) -> Any:
    if is_use_cache:
        if response := await cache.aget(_get_cache_key(url)):
            return response

    retries_max = 3
    for retry_current in range(retries_max):
        try:
            if await _is_api_limit_exceeded(url):
                raise ApiLimitExceeded()

            response = await sync_to_async(requests.get)(url, timeout=10)
            response.raise_for_status()
            response_json = response.json()
            if is_use_cache:
                timeout_sec = None
                if cache_expiry_days:
                    timeout_sec = cache_expiry_days * 24 * 60
                await cache.aset(_get_cache_key(url), value=response_json, timeout=timeout_sec)
            return response_json
        except (requests.RequestException, JSONDecodeError):
            if retry_current >= retries_max:
                raise
            await asyncio.sleep(2**retry_current)
    else:
        raise


async def _is_api_limit_exceeded(url: str) -> bool:
    await ApiHourlyLimit.objects.filter(source=_get_api_source(url)).aupdate(
        count_current=F("count_current") + 1
    )
    api_limit = await _get_api_limit(url)
    if (
        api_limit.source is ApiSource.Algolia
        and api_limit.count_current >= api_limit.count_max_per_hour
    ):
        return True
    return False


async def _get_api_limit(url: str) -> ApiHourlyLimit:
    limit, _ = await ApiHourlyLimit.objects.aget_or_create(
        source=_get_api_source(url),
        created_at__gte=timezone.now() - timedelta(hours=1),
    )
    return limit


def _get_cache_key(url: str) -> str:
    if match := re.search(r"/items?/(?P<item_id>\d+)", url):
        return f"post-{_get_api_source(url).value}-{match.group('item_id')}.json"
    return url


def _get_api_source(url: str) -> ApiSource:
    source = ApiSource.HackerNews
    match url:
        case s if "hn.algolia.com" in s:
            source = ApiSource.Algolia
        case s if "hacker-news.firebaseio.com" in s:
            source = ApiSource.HackerNews
        case _:
            raise ValueError()
    return source


class ApiLimitExceeded(Exception):
    pass
