import logging
from dataclasses import dataclass

import requests
from asgiref.sync import sync_to_async
from bs4 import BeautifulSoup
from django.core.cache import cache


logger = logging.getLogger(__name__)


async def import_html_meta(
    url: str,
    is_use_cache: bool = True,
) -> ImportMetaOutput:
    if is_use_cache:
        if response_cached := await cache.aget(url):
            return _extract_meta_from_html(response_cached)

    response = await sync_to_async(requests.get)(url, timeout=10)
    if is_use_cache:
        await cache.aset(url, response.text)

    return _extract_meta_from_html(response.text)


def _extract_meta_from_html(html_raw: str):
    soup = BeautifulSoup(html_raw, "lxml")
    meta_dict = {}
    for meta_tag in soup.find_all("meta"):
        if name := (meta_tag.get("property") or meta_tag.get("name")):
            meta_dict[name] = meta_tag.get("content", "")

    return ImportMetaOutput(
        content=meta_dict.get("og:description") or meta_dict.get("description") or "",  # type: ignore
        image=str(meta_dict.get("og:image", "")),
    )


@dataclass
class ImportMetaOutput:
    content: str
    image: str
