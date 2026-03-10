"""
#AI
"""

import csv
import re
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlparse

import requests
from asgiref.sync import sync_to_async
from django.core.files.base import ContentFile

from neuronhub.apps.algolia.services.disable_auto_indexing_if_enabled import (
    disable_auto_indexing_if_enabled,
)
from neuronhub.apps.jobs.services.csv_import import TagParams
from neuronhub.apps.jobs.services.csv_import import _get_or_create_tags
from neuronhub.apps.jobs.services.csv_import import _list_split_and_strip
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.posts.graphql.types_lazy import TagCategoryEnum


@dataclass
class OrgSyncStats:
    created: int = 0
    updated: int = 0


async def csv_import_orgs(
    csv_path: Path,
    limit: int | None = None,
    is_download_logos: bool = True,
) -> OrgSyncStats:
    stats = OrgSyncStats()

    with disable_auto_indexing_if_enabled():
        orgs_dict = _parse_orgs_csv(csv_path)
        for org_dict in orgs_dict[:limit] if limit else orgs_dict:
            if not org_dict:
                continue

            tags_area_names = _list_split_and_strip(org_dict.pop("tags_area"))
            tags_area = await _get_or_create_tags(
                tag_params_list=[TagParams(name=name) for name in tags_area_names],
                category=TagCategoryEnum.Area,
            )

            logo_raw = org_dict.pop("logo_raw")

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


def _parse_orgs_csv(csv_path: Path) -> list[dict]:
    with open(csv_path, newline="", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)
        rows = list(reader)

    orgs = []
    for row in rows:
        website = row.get("Website", "").strip()
        org = {
            "name": row.get("Name", "").strip().replace('"', ""),
            "website": website,
            "domain": _extract_domain(website),
            "jobs_page_url": row.get("Jobs Page", "").strip(),
            "is_highlighted": row.get("Impact Tags", "").strip() == "Highlighted Org",
            "tags_area": row.get("Org Cause Area", ""),
            "logo_raw": row.get("Logo", "").strip(),
        }
        if not org["name"]:
            continue
        orgs.append(org)
    return orgs


def _extract_domain(url: str) -> str:
    if not url:
        return ""
    hostname = urlparse(url).hostname or ""
    if hostname.startswith("www."):
        hostname = hostname[4:]
    return hostname


def _parse_logo_field(logo_raw: str) -> tuple[str, str] | None:
    """Parse CSV logo field: 'filename.jpeg (https://url)' → (filename, url)."""
    match = re.match(r"^(.+?)\s+\((https?://.+)\)$", logo_raw)
    if not match:
        return None
    return match.group(1).strip(), match.group(2).strip()
