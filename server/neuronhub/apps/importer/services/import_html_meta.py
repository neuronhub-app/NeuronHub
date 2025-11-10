import requests
from asgiref.sync import sync_to_async
from pydantic import BaseModel
from bs4 import BeautifulSoup
from django.core.cache import cache


class ImportMetaInput(BaseModel):
    # post_id: int
    url: str


class ImportMetaOutput(BaseModel):
    content: str
    image: str


# @hatchet.task(name="import_html_meta", input_validator=ImportMetaInput)
async def import_html_meta(
    args: ImportMetaInput,
    # ctx: Context,
    is_use_cache: bool = True,
) -> ImportMetaOutput:
    # ctx.log(f"importing <meta> from {args.url}")

    if is_use_cache:
        if response_cached := await cache.aget(args.url):
            return _extract_meta_from_html(response_cached)

    response = await sync_to_async(requests.get)(args.url, timeout=10)
    if is_use_cache:
        await cache.aset(args.url, response.text)

    return _extract_meta_from_html(response.text)


def _extract_meta_from_html(html_raw: str):
    soup = BeautifulSoup(html_raw, "lxml")
    meta_dict = {}
    for meta_tag in soup.find_all("meta"):
        if name := (meta_tag.get("property") or meta_tag.get("name")):
            # noinspection PyUnboundLocalVariable
            meta_dict[name] = meta_tag.get("content", "")

    # ctx.log(f"importing meta: {meta_dict}")

    return ImportMetaOutput(
        content=meta_dict.get("og:description") or meta_dict.get("description") or "",  # type: ignore
        image=str(meta_dict.get("og:image", "")),
    )
