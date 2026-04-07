"""
#quality-20% #AI
"""

import csv
import re
from dataclasses import dataclass
from pathlib import Path

from neuronhub.apps.jobs.models import JobAlert
from neuronhub.apps.jobs.models import JobLocation
from neuronhub.apps.posts.graphql.types_lazy import TagCategory
from neuronhub.apps.posts.models import PostTag
from neuronhub.apps.posts.models import PostTagCategory


@dataclass
class CsvImportStats:
    created: int = 0
    invalid_location: int = 0


async def csv_import_job_alerts(csv_path: Path) -> CsvImportStats:
    stats = CsvImportStats()
    rows = _parse_csv(csv_path)

    for row in rows:
        tags_m2m: list[PostTag] = []
        for csv_col, category in _TAG_COL_TO_CATEGORY.items():
            raw = row.get(csv_col, "")
            if raw:
                tags_m2m.extend(
                    await _sync_tags(
                        names=[n.strip() for n in raw.split(",") if n.strip()],
                        category=category,
                    )
                )

        locations, has_invalid = await _sync_locations_from_countries(
            row.get("countries_values", ""),
        )

        alert = await JobAlert.objects.acreate(
            email=row["Email"],
            is_active=False,
            is_remote=_parse_yes_no(row.get("remote_job (Webflow)", "")),
            is_orgs_highlighted=_parse_yes_no(row.get("highlighted_orgs", "")),
            salary_min=_parse_salary_min(row.get("salary_values", "")),
            is_invalid_location=has_invalid,
        )

        if tags_m2m:
            await alert.tags.aset(tags_m2m)
        if locations:
            await alert.locations.aset(locations)

        stats.created += 1
        if has_invalid:
            stats.invalid_location += 1

    return stats


_TAG_COL_TO_CATEGORY: dict[str, TagCategory] = {
    "cause_areas_values": TagCategory.Area,
    "skillsets_values": TagCategory.Skill,
    "education_level_values": TagCategory.Education,
    "experience_values": TagCategory.Experience,
    "role_type_values": TagCategory.Workload,
}


def _parse_yes_no(raw: str) -> bool | None:
    match raw.strip().lower():
        case "yes":
            return True
        case "no":
            return False
        case _:
            return None


def _parse_salary_min(raw: str) -> int | None:
    raw = raw.strip()
    if not raw:
        return None
    # Format: "$50000 - $200000"
    first = raw.split(" - ")[0]
    return int(first.replace("$", "").replace(",", ""))


async def _sync_tags(names: list[str], category: TagCategory) -> list[PostTag]:
    category_obj, _ = await PostTagCategory.objects.aget_or_create(name=category.value)
    tags = []
    for name in names:
        mapped = _map_tag_name(name)
        tag, _ = await PostTag.objects.aget_or_create(name=mapped)
        await tag.categories.aadd(category_obj)
        tags.append(tag)
    return tags


async def _sync_locations_from_countries(raw: str) -> tuple[list[JobLocation], bool]:
    """Returns (locations, has_invalid)."""
    if not raw:
        return [], False
    names = [n.strip() for n in raw.split(",") if n.strip()]
    locs = []
    has_invalid = False
    for name in names:
        mapped = _map_country_name(name)
        if mapped is None:
            has_invalid = True
            continue
        loc, _ = await JobLocation.objects.aget_or_create(
            name=mapped,
            defaults={
                "type": JobLocation.LocationType.COUNTRY,
                "country": mapped,
            },
        )
        locs.append(loc)
    return locs, has_invalid


_COUNTRY_NAME_OVERRIDES: dict[str, str] = {
    "United States (USA)": "USA",
    "United Kingdom (UK)": "UK",
    "C\u00f4te d\u2019Ivoire": "C\u00f4te d'Ivoire",  # curly quote → ASCII apostrophe
}

# Values that aren't real countries — meta-regions, remote, arabic, etc.
_INVALID_LOCATION_VALUES: frozenset[str] = frozenset(
    {
        "EU",
        "Europe",
        "Africa",
        "Remote",
        "Global",
        "Multiple Locations: APAC Region",
        "Multiple Locations: Africa",
        "Multiple Locations: Europe",
    }
)

_RE_ARABIC = re.compile(r"[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]")


def _map_country_name(raw: str) -> str | None:
    """Returns None for invalid/unmappable values."""
    if raw in _INVALID_LOCATION_VALUES:
        return None
    if _RE_ARABIC.search(raw):
        return None
    if raw in _COUNTRY_NAME_OVERRIDES:
        return _COUNTRY_NAME_OVERRIDES[raw]
    return raw


# Old jobalerts CSV values → canonical jobs CSV values
_TAG_NAME_OVERRIDES: dict[str, str] = {
    # cause areas
    "Biosecurity & Pandemic Preparedness": "Biosecurity",
    "Career Capital": "Career-Capital",
    "Mental Health": "Mental Health & Wellbeing",
    # role types
    "Full-time": "Full-Time",
    "Part-time": "Part-Time",
    # education
    "Doctoral degree": "Doctoral Degree",
    "Master's degree": "Master's Degree",
    "Undergraduate degree": "Undergraduate Degree or Less",
    # experience
    "Entry-level": "Entry-Level",
    "Junior (1-4 years experience)": "Junior (1\u20134y)",
    "Mid (5-9 years experience)": "Mid (5\u20139y)",
    "Senior (10+ years experience)": "Senior (10y+)",
    # skills
    "Content & Communications": "Communications & Outreach",
    "Outreach": "Communications & Outreach",
}


def _map_tag_name(raw: str) -> str:
    return _TAG_NAME_OVERRIDES.get(raw, raw)


def _parse_csv(csv_path: Path) -> list[dict]:
    with open(csv_path, newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))
