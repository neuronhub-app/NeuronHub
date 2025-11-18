"""
todo refac: api limit should be a class or a namespace
"""

import asyncio
import re
from datetime import timedelta
from json import JSONDecodeError
from pathlib import Path
from typing import Any

import requests
from django.core.cache import cache

from asgiref.sync import sync_to_async
from django.db.models import F
from django.utils import timezone

from neuronhub.apps.importer.models import ApiHourlyLimit, ApiSource


async def request_json(url: str, is_use_cache: bool = False) -> Any:
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
                await cache.aset(_get_cache_key(url), response_json)
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


def _get_cache_key(url: str) -> Path:
    cache_dir = Path(__file__).parent / "cache"
    if match := re.search(r"/items?/(?P<item_id>\d+)", url):
        return (
            cache_dir / f"post-{_get_api_source(url).value}-{match.group('item_id')}.cache.json"
        )
    return cache_dir / "list.cache.json"


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
