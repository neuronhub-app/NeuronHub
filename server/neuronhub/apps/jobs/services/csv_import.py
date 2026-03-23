"""
#AI (refactored 2 times)
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
from neuronhub.apps.posts.graphql.types_lazy import TagCategoryEnum
from neuronhub.apps.posts.models import PostTag
from neuronhub.apps.posts.models import PostTagCategory


@dataclass
class CsvSyncStats:
    created: int = 0
    updated: int = 0


async def csv_import_jobs(csv_path: Path, limit: int | None = None) -> CsvSyncStats:
    stats = CsvSyncStats()

    with disable_auto_indexing_if_enabled():
        jobs_dict = _parse_jobs_csv(csv_path)
        for job_dict in jobs_dict[:limit] if limit else jobs_dict:
            if not job_dict:
                continue

            tags_by_field_name: dict[str, list[PostTag]] = {}
            for category in TagCategoryEnum:
                tag_field_name = f"tags_{category.value}"
                raw_values = job_dict.pop(tag_field_name, "")
                if not raw_values:
                    continue

                tags_by_field_name[tag_field_name] = await _get_or_create_tags(
                    tag_params_list=[
                        TagParams(name=val) for val in _list_split_and_strip(raw_values)
                    ],
                    category=category,
                )

            is_visa_sponsorship = job_dict.pop("_has_visa_sponsorship", False)
            location_names: list[str] = job_dict.pop("_location_names", [])

            org_name = job_dict.pop("org_name", "").replace('"', "")
            if not org_name:
                org_name = job_dict["title"]
            org, _ = await Org.objects.aget_or_create(name=org_name)

            job, is_created = await Job.objects.aupdate_or_create(
                url_external=job_dict["url_external"],
                defaults={
                    **job_dict,
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

            locations = []
            for loc_name in location_names:
                loc, _ = await JobLocation.objects.aget_or_create(name=loc_name)
                locations.append(loc)
            await job.locations.aset(locations)

            if is_visa_sponsorship:
                country_tags = tags_by_field_name.get("tags_country", [])
                await _create_visa_child_tags([t.name for t in country_tags])
                await job.tags_country_visa_sponsor.aset(country_tags)

    return stats


async def _get_or_create_tags(
    tag_params_list: list[TagParams],
    category: TagCategoryEnum,
) -> list[PostTag]:
    category_obj, _ = await PostTagCategory.objects.aget_or_create(name=category.value)
    tags = []
    for tag_params in tag_params_list:
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


# #AI
def _parse_location_field(raw: str) -> ParsedLocations:
    if not raw:
        return ParsedLocations(cities=[], countries=[], is_remote=False, raw_locations=[])

    # Location(s) is a quoted-CSV field: "City, Country","City2, Country2"
    locations_raw = next(csv.reader(StringIO(raw)), [])

    cities: list[str] = []
    countries: list[str] = []
    is_remote = False

    for location_raw in locations_raw:
        location_raw = location_raw.strip()
        if not location_raw:
            continue
        city_and_country = location_raw.rsplit(", ", 1)
        if len(city_and_country) != 2:
            continue
        city_name, country_name = city_and_country[0].strip(), city_and_country[1].strip()
        if city_name == "Remote":
            is_remote = True
            if country_name != "Global":
                countries.append(country_name)
        else:
            cities.append(city_name)
            countries.append(country_name)

    return ParsedLocations(
        cities=list(dict.fromkeys(cities)),
        countries=list(dict.fromkeys(countries)),
        is_remote=is_remote,
        raw_locations=[loc.strip() for loc in locations_raw if loc.strip()],
    )


@dataclass
class ParsedLocations:
    cities: list[str]
    countries: list[str]
    is_remote: bool
    raw_locations: list[str]


def _parse_jobs_csv(csv_path: Path) -> list[dict]:
    with open(csv_path, newline="", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)
        job_rows = list(reader)

    jobs_dict = []
    for row in job_rows:
        job: dict = {}

        for name_csv, name_django in {
            "Job Title": "title",
            "Organization": "org_name",
            "Job Link": "url_external",
            "Cause Area(s)": "tags_area",
            "Role Type": "tags_workload",
            "Education": "tags_education",
            "Experience": "tags_experience",
            "Skill Sets": "tags_skill",
        }.items():
            job[name_django] = row.get(name_csv, "").strip()

        location = _parse_location_field(row.get("Location(s)", ""))
        job["tags_country"] = ",".join(location.countries)
        job["tags_city"] = ",".join(location.cities)
        job["is_remote"] = location.is_remote
        job["_location_names"] = location.raw_locations

        job_desc = row.get("Job Description", "").strip()
        job["description"] = job_desc
        job["_has_visa_sponsorship"] = "visa" in job_desc.lower()

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


def _list_split_and_strip(str_raw: str) -> list[str]:
    if not str_raw:
        return []
    return [tag.strip() for tag in str_raw.split(",") if tag.strip()]


async def _create_visa_child_tags(country_names: list[str]) -> None:
    """
    #AI
    """
    visa_cat, _ = await PostTagCategory.objects.aget_or_create(
        name=TagCategoryEnum.VisaSponsorship.value
    )
    for country_name in country_names:
        parent_tag = await PostTag.objects.filter(name=country_name, tag_parent=None).afirst()
        if not parent_tag:
            continue
        child_tag, _ = await PostTag.objects.aget_or_create(
            name=f"can sponsor visas ({country_name})",
            tag_parent=parent_tag,
        )
        await child_tag.categories.aadd(visa_cat)
