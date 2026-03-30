"""
#quality-62% #AI (refactored 4 times)

Issues:
- job_parsed `_*` fields -> return as a Dataclass, not pop()
- no Job field types verification
- magic strings
"""

import csv
from dataclasses import dataclass
from dataclasses import field
from datetime import UTC
from datetime import datetime
from io import StringIO
from pathlib import Path

from neuronhub.apps.algolia.services.disable_auto_indexing_if_enabled import (
    disable_auto_indexing_if_enabled,
)
from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.models import JobLocation
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.posts.graphql.types_lazy import TagCategory
from neuronhub.apps.posts.models import PostTag
from neuronhub.apps.posts.models import PostTagCategory


@dataclass
class CsvSyncStats:
    created: int = 0
    updated: int = 0
    unpublished: int = 0


async def csv_import_jobs(csv_path: Path, limit: int | None = None) -> CsvSyncStats:
    return await _import_jobs_parsed(_parse_jobs_csv(csv_path), limit=limit)


async def _import_jobs_parsed(jobs_parsed: list[dict], limit: int | None = None) -> CsvSyncStats:
    stats = CsvSyncStats()

    with disable_auto_indexing_if_enabled():
        jobs_parsed_limited = jobs_parsed[:limit] if limit else jobs_parsed

        for job_parsed in jobs_parsed_limited:
            if not job_parsed:
                continue

            is_visa_sponsor = job_parsed.pop(col_key.visa_sponsor, False)
            locs_parsed: list[LocationParsed] = job_parsed.pop(col_key.loc_parsed, [])

            tags_by_field_name: dict[str, list[PostTag]] = {}
            for category, tag_field_name in Job.tag_category_to_field.items():
                tags_raw = job_parsed.pop(tag_field_name, "")
                tags_by_field_name[tag_field_name] = (
                    await _sync_tags(
                        params_list=[
                            TagParams(name=tag) for tag in _list_split_and_strip(tags_raw)
                        ],
                        category=category,
                    )
                    if tags_raw
                    else []
                )

            # strip of `"` is #AI
            org_name = job_parsed.pop(col_key.org_name, "").replace('"', "")
            if not org_name:
                org_name = job_parsed["title"]
            org, _ = await Org.objects.aget_or_create(name=org_name)

            job, is_created = await Job.objects.aupdate_or_create(
                url_external=job_parsed["url_external"],
                defaults={
                    **job_parsed,
                    "org": org,
                    "visibility": Visibility.PUBLIC,
                },
            )
            if is_created:
                stats.created += 1
            else:
                stats.updated += 1

            for tag_field_name, tags in tags_by_field_name.items():
                await getattr(job, tag_field_name).aset(tags)

            await job.locations.aset(await _sync_locations(locs_parsed))

            if is_visa_sponsor:
                await job.tags_country_visa_sponsor.aset(
                    await _sync_tags_visa(locs_parsed),
                )

        urls_external_synced = {
            job_posted["url_external"] for job_posted in jobs_parsed_limited if job_posted
        }
        stats.unpublished = await (
            Job.objects.filter(is_published=True)
            .exclude(url_external__in=urls_external_synced)
            .aupdate(is_published=False)
        )

    return stats


async def _sync_locations(locs_parsed: list[LocationParsed]) -> list[JobLocation]:
    locs = []
    for loc_parsed in locs_parsed:
        loc, _ = await JobLocation.objects.aget_or_create(
            name=loc_parsed.name,
            defaults={
                "city": loc_parsed.city,
                "country": loc_parsed.country,
                "is_remote": loc_parsed.is_remote,
            },
        )
        locs.append(loc)
    return locs


async def _sync_tags_visa(locs_parsed: list[LocationParsed]) -> list[PostTag]:
    locs_onsite_with_country = [loc for loc in locs_parsed if loc.country and not loc.is_remote]
    countries_onsite = list(dict.fromkeys(loc.country for loc in locs_onsite_with_country))

    tags_country = await _sync_tags(
        params_list=[TagParams(name=country) for country in countries_onsite],
        category=TagCategory.Country,
    )

    tag_category_visa, _ = await PostTagCategory.objects.aget_or_create(
        name=TagCategory.VisaSponsorship.value
    )
    for tag_country in tags_country:
        tag_child, _ = await PostTag.objects.aget_or_create(
            name=f"can sponsor visas ({tag_country.name})",
            tag_parent=tag_country,
        )
        await tag_child.categories.aadd(tag_category_visa)

    return tags_country


def _list_split_and_strip(str_list_raw: str) -> list[str]:
    if not str_list_raw:
        return []
    return [str_raw.strip() for str_raw in str_list_raw.split(",") if str_raw.strip()]


async def _sync_tags(params_list: list[TagParams], category: TagCategory) -> list[PostTag]:
    category_obj, _ = await PostTagCategory.objects.aget_or_create(name=category.value)
    tags = []
    for tag_params in params_list:
        tag, _ = await PostTag.objects.aget_or_create(
            name=tag_params.name,
            defaults={"aliases": tag_params.aliases},
        )
        await tag.categories.aadd(category_obj)
        tags.append(tag)
    return tags


@dataclass
class TagParams:
    name: str
    aliases: list[str] = field(default_factory=list)


# #quality-28% #AI
def _parse_location_field(raw: str) -> list[LocationParsed]:
    if not raw:
        return []

    # Location(s) is a quoted-CSV field: "City, Country","City2, Country2"
    locations_raw = next(csv.reader(StringIO(raw)), [])
    locations: list[LocationParsed] = []

    for location_raw in locations_raw:
        location_raw = location_raw.strip()
        if not location_raw:
            continue
        city_and_country = location_raw.rsplit(", ", 1)
        if len(city_and_country) != 2:
            continue
        city_name, country_name = city_and_country[0].strip(), city_and_country[1].strip()
        if city_name == "Remote":
            locations.append(
                LocationParsed(
                    name=location_raw,
                    city="",
                    country=country_name,
                    is_remote=True,
                )
            )
        else:
            locations.append(
                LocationParsed(
                    name=location_raw,
                    city=city_name,
                    country=country_name,
                    is_remote=False,
                )
            )

    return locations


@dataclass
class LocationParsed:
    name: str
    city: str
    country: str
    is_remote: bool


class col_key:
    loc_parsed = "_locs_parsed"
    visa_sponsor = "_has_visa_sponsorship"
    org_name = "_org_name"


def _parse_jobs_csv(csv_path: Path) -> list[dict]:
    with open(csv_path, newline="", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)
        job_rows = list(reader)

    jobs_dict = []
    for row in job_rows:
        job = {}

        for name_csv, name_django in {
            "Job Title": "title",
            "Organization": col_key.org_name,
            "Job Link": "url_external",
            "Cause Area(s)": "tags_area",
            "Role Type": "tags_workload",
            "Education": "tags_education",
            "Experience": "tags_experience",
            "Skill Sets": "tags_skill",
        }.items():
            job[name_django] = row.get(name_csv, "").strip()

        job[col_key.loc_parsed] = _parse_location_field(row.get("Location(s)", ""))

        job_desc = row.get("Job Description", "").strip()
        job["description"] = job_desc
        job[col_key.visa_sponsor] = "visa" in job_desc.lower()

        if salary_raw := row.get("Min Salary (USD)", ""):
            job["salary_min"] = int(float(salary_raw))
        if salary_text := row.get("Salary Range", "").strip():
            job["salary_text"] = salary_text

        if closes_at_raw := row.get("Deadline", ""):
            job["closes_at"] = datetime.strptime(closes_at_raw, "%Y-%m-%d").replace(tzinfo=UTC)

        if posted_at_raw := row.get("Date Added", ""):
            job["posted_at"] = datetime.strptime(posted_at_raw, "%B %d, %Y %I:%M%p").replace(
                tzinfo=UTC
            )

        jobs_dict.append(job)

    return jobs_dict
