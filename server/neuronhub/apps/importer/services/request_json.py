import asyncio
import logging
import re
from json import JSONDecodeError
from typing import Any

import requests
from asgiref.sync import sync_to_async
from django.core.cache import cache
from django.db.models import F
from django.utils import timezone

from neuronhub.apps.importer.models import ApiHourlyLimit
from neuronhub.apps.importer.models import ApiSource


logger = logging.getLogger(__name__)


async def request_json(
    url: str, is_use_cache: bool = False, cache_expiry_days: int | None = None
) -> Any:
    if is_use_cache:
        if response := await cache.aget(_get_cache_key(url)):
            return response

    retries_max = 3
    for retry_current in range(retries_max):
        try:
            if not await _increment_api_limit_and_confirm_allowance(url):
                raise ApiLimitExceeded()

            response = await sync_to_async(requests.get)(url, timeout=10)
            response.raise_for_status()
            response_json = response.json()
            if is_use_cache:
                cache_expiry_sec = None
                if cache_expiry_days:
                    cache_expiry_sec = cache_expiry_days * 24 * 60
                await cache.aset(
                    _get_cache_key(url), value=response_json, timeout=cache_expiry_sec
                )
            return response_json
        except (requests.RequestException, JSONDecodeError, ApiLimitExceeded) as exc:
            if retry_current >= retries_max:
                raise
            sleep_sec = 4**retry_current + 1
            logger.error(f"Error request_json({url}), retry in {sleep_sec}sec. Error: {exc}")
            await asyncio.sleep(sleep_sec)
    else:
        raise


async def _increment_api_limit_and_confirm_allowance(url: str) -> bool:
    source = _get_api_source(url)
    datetime_now = timezone.now()

    is_allowed_and_count_incremented = await ApiHourlyLimit.objects.filter(
        source=source,
        query_date=datetime_now.date(),
        query_hour=datetime_now.hour,
        count_current__lt=F("count_max_per_hour"),
    ).aupdate(count_current=F("count_current") + 1)

    if is_allowed_and_count_incremented:
        return True

    api_limit, is_new_limit_created = await ApiHourlyLimit.objects.aget_or_create(
        source=source,
        query_date=datetime_now.date(),
        query_hour=datetime_now.hour,
        defaults={"count_current": 1},
    )
    if is_new_limit_created:
        return True
    elif api_limit.count_current < api_limit.count_max_per_hour:
        return True

    return False


def _get_cache_key(url: str) -> str:
    if match := re.search(r"/items?/(?P<item_id>\d+)", url):
        return f"post-{_get_api_source(url).value}-{match.group('item_id')}.json"
    return url


def _get_api_source(url: str) -> ApiSource:
    match url:
        case s if "hn.algolia.com" in s:
            return ApiSource.Algolia
        case s if "hacker-news.firebaseio.com" in s:
            return ApiSource.HackerNews
        case _:
            raise ValueError()


class ApiLimitExceeded(Exception):
    pass
