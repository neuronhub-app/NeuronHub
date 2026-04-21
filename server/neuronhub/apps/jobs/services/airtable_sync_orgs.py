"""
#AI

This is a copy of `csv_import_orgs.py` - see Git if needed.
"""

import re
from dataclasses import dataclass
from urllib.parse import urlparse

import requests
from asgiref.sync import sync_to_async
from django.conf import settings
from django.core.files.base import ContentFile
from pyairtable import Api
from pyairtable.api.types import RecordDict

from neuronhub.apps.algolia.services.disable_auto_indexing_if_enabled import (
    disable_auto_indexing_if_enabled,
)
from neuronhub.apps.jobs.services.airtable_sync_jobs import TagParams
from neuronhub.apps.jobs.services.airtable_sync_jobs import _list_split_and_strip
from neuronhub.apps.jobs.services.airtable_sync_jobs import _sync_tags
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.posts.graphql.types_lazy import TagCategoryEnum


HIGHLIGHTED_IMPACT_TAG = "Highlighted Org"


@dataclass
class OrgSyncStats:
    created: int = 0
    updated: int = 0


async def airtable_sync_orgs(is_download_logos: bool = True) -> OrgSyncStats:
    return await _import_orgs_parsed(
        [_parse_airtable_record(record) for record in _fetch_airtable_records()],
        is_download_logos=is_download_logos,
    )


def _fetch_airtable_records() -> list[RecordDict]:
    table = Api(settings.PG_AIRTABLE_API).table("appZANZAyzdYZvei2", "tblWheNh021vtYcEs")
    return table.all(
        view="viwQ4zHDxVUBZZWEs",
        cell_format="string",
        time_zone=settings.TIME_ZONE,
        user_locale="en-us",
    )


async def _import_orgs_parsed(
    orgs_parsed: list[dict],
    is_download_logos: bool = True,
) -> OrgSyncStats:
    stats = OrgSyncStats()

    with disable_auto_indexing_if_enabled():
        for org_dict in orgs_parsed:
            if not org_dict.get("name"):
                continue

            tags_area_names = _list_split_and_strip(org_dict.pop("tags_area"))
            tags_area = await _sync_tags(
                params_list=[TagParams(name=name) for name in tags_area_names],
                category=TagCategoryEnum.Area,
            )

            logo_raw = org_dict.pop("logo_raw")

            # #prob-redundant: aupdate_or_create bumps updated_at on every row
            # (same churn we rewrote jobs to avoid). Kept because Airtable is
            # short-lived - if it stays, add an md-diff gate like jobs.
            org, is_created = await Org.objects.aupdate_or_create(
                name=org_dict["name"],
                defaults=org_dict,
            )
            if is_created:
                stats.created += 1
            else:
                stats.updated += 1

            await org.tags_area.aset(tags_area)

            if is_download_logos and logo_raw and not org.logo:
                await _download_and_save_logo(org, logo_raw)

    return stats


async def _download_and_save_logo(org: Org, logo_raw: str) -> None:
    parsed = _parse_logo_field(logo_raw)
    if not parsed:
        return
    filename, url = parsed

    resp = await sync_to_async(requests.get)(url, timeout=30)
    if resp.status_code != 200:
        return

    await sync_to_async(org.logo.save)(filename, ContentFile(resp.content), save=True)


def _parse_airtable_record(org_raw: RecordDict) -> dict:
    fields = org_raw.get("fields", {})
    website = fields.get("Website", "").strip()
    return {
        "name": fields.get("Name", "").strip().replace('"', ""),
        "website": website,
        "website_with_utm": fields.get("UTM Website", "").strip(),
        "domain": _extract_domain(website),
        "jobs_page_url": fields.get("Jobs Page", "").strip(),
        "description": fields.get("Org Description", "").strip(),
        "is_highlighted": fields.get("Impact Tags", "").strip() == HIGHLIGHTED_IMPACT_TAG,
        "tags_area": fields.get("Org Cause Area", ""),
        "logo_raw": fields.get("Logo", "").strip(),
    }


def _extract_domain(url: str) -> str:
    if not url:
        return ""
    hostname = urlparse(url).hostname or ""
    if hostname.startswith("www."):
        hostname = hostname[4:]
    return hostname


def _parse_logo_field(logo_raw: str) -> tuple[str, str] | None:
    """Parse 'filename.jpeg (https://url)' → (filename, url)."""
    match = re.match(r"^(.+?)\s+\((https?://.+)\)$", logo_raw)
    if not match:
        return None
    return match.group(1).strip(), match.group(2).strip()
