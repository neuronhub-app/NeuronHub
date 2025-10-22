"""
todo refac: api limit should be a class or a namespace
"""

import asyncio
import json
import re
from datetime import timedelta
from json import JSONDecodeError
from pathlib import Path
from typing import Any

import requests
from asgiref.sync import sync_to_async
from django.db.models import F
from django.utils import timezone

from neuronhub.apps.importer.models import ApiHourlyLimit, ApiSource


async def request_json(url: str, is_use_cache: bool = False) -> Any:
    cache = ApiCachePermanent(url)
    if is_use_cache:
        if response := await cache.get():
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
                await cache.save(response_json)
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
    if api_limit.count_current >= api_limit.count_max_per_hour:
        return True
    return False


async def _get_api_limit(url: str) -> ApiHourlyLimit:
    limit, _ = await ApiHourlyLimit.objects.aget_or_create(
        source=_get_api_source(url),
        created_at__gte=timezone.now() - timedelta(hours=1),
    )
    return limit


class ApiCachePermanent:
    def __init__(self, url: str):
        self._path: Path = self._build_json_path(url)

    async def get(self) -> Any | None:
        if not self._path.exists():
            return None

        with open(self._path) as file:
            return json.load(file)

    async def save(self, data: Any) -> None:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        with open(self._path, "w") as file:
            json.dump(data, file, indent=4)

    def _build_json_path(self, url: str) -> Path:
        cache_dir = Path(__file__).parent / "cache"
        if match := re.search(r"/items?/(?P<item_id>\d+)", url):
            return (
                cache_dir
                / f"post-{_get_api_source(url).value}-{match.group('item_id')}.cache.json"
            )
        return cache_dir / "list.cache.json"


def _get_api_source(url: str) -> ApiSource:
    source = ApiSource.HackerNews
    match url:
        case s if "hn.algolia.com" in s:
            source = ApiSource.HackerNewsAlgolia
        case s if "hacker-news.firebaseio.com" in s:
            source = ApiSource.HackerNews
        case _:
            raise ValueError()
    return source


class ApiLimitExceeded(Exception):
    pass
