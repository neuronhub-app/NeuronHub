"""
Syncs PG Airtable. Mark missing Jobs.is_published=False -> drop out of Algolia.

#quality-30% #AI
- 63% -> 20%: regurgitated slop for Job drafts
- 20% -> 28%: cleanup by LLM & hands
- 28% -> 24%: logic for is_pending_removal by LLM
- 24% -> 30%: test & patch with prod data
"""

import csv
import logging
from dataclasses import dataclass
from dataclasses import field
from datetime import UTC
from datetime import datetime
from enum import Enum
from io import StringIO

import sentry_sdk
from django.conf import settings
from pyairtable import Api
from pyairtable.api.types import RecordDict

from neuronhub.apps.algolia.services.disable_auto_indexing_if_enabled import (
    disable_auto_indexing_if_enabled,
)
from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.models import JobLocation
from neuronhub.apps.jobs.services.serialize_job_to_markdown import serialize_job_to_markdown
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.posts.graphql.types_lazy import TagCategory
from neuronhub.apps.posts.models import PostTag
from neuronhub.apps.posts.models import PostTagCategory


logger = logging.getLogger(__name__)


@dataclass
class SyncStats:
    created: int = 0
    updated: int = 0
    unpublished: int = 0
    not_changed: int = 0

    ids_to_reindex: list[int] = field(default_factory=list)


async def airtable_sync_jobs(limit: int | None = None) -> SyncStats:
    jobs_raw = _fetch_airtable_jobs()

    return await _sync_jobs_parsed(
        [_parse_job_raw(job_raw) for job_raw in jobs_raw],
        limit=limit,
    )


def _fetch_airtable_jobs() -> list[RecordDict]:
    """
    #AI
    - cell_format=string resolves linked records & lookups to readable strings - matching the prev CSV format. # todo ? refac: drop - dumb idea
    - Airtable API requires `time_zone` & `user_locale`.
    - `time_zone=settings.TIME_ZONE` (PT): matches legacy CSV import.
    """
    table = Api(settings.PG_AIRTABLE_API).table(
        base_id="appZANZAyzdYZvei2",
        table_name="tblM4GwZ5sTa3ruXW",
    )
    return table.all(
        view="viwciUHc5VAV0L39e",
        cell_format="string",
        time_zone=settings.TIME_ZONE,
        user_locale="en-us",
    )


async def _sync_jobs_parsed(jobs_parsed: list[JobParsed], limit: int = None) -> SyncStats:
    stats = SyncStats()

    with disable_auto_indexing_if_enabled():
        jobs_parsed = jobs_parsed[:limit] if limit else jobs_parsed

        for job_parsed in jobs_parsed:
            sync_output = await _sync_job_parsed(job_parsed)

            logger.debug(f"Job synced: status={sync_output.result.value}, pk={sync_output.pk}")

            match sync_output.result:
                case SyncResult.Created:
                    stats.created += 1
                case SyncResult.Updated:
                    stats.updated += 1
                case SyncResult.NotChanged:
                    stats.not_changed += 1

        job_urls_in_airtable = {job_parsed.url_external for job_parsed in jobs_parsed}
        async for job_published in (
            Job.objects.filter(is_published=True)
            .exclude(url_external__in=job_urls_in_airtable)
            .select_related("org")
        ):
            if await job_published.versions.filter(is_pending_removal=True).aexists():
                continue
            job_removal_draft = await _create_job_draft_is_pending_removal(job_published)
            await job_published.versions.aadd(job_removal_draft)
            stats.unpublished += 1

    return stats


@dataclass
class SyncOutput:
    pk: int
    result: SyncResult


class SyncResult(Enum):
    Created = "Created"
    Updated = "Updated"
    NotChanged = "NotChanged"


async def _sync_job_parsed(job_parsed: JobParsed) -> SyncOutput:
    """
    Writes only to Job drafts (is_published=False).

    Diff gate via `serialize_job_to_markdown` -> no Job.updated_at bump -> no Algolia reindex.
    """
    # if reappeared in Airtable -> drop is_pending_removal draft.
    await Job.objects.filter(
        is_pending_removal=True, url_external=job_parsed.url_external
    ).adelete()

    org_name = job_parsed.org_name.replace('"', "") or job_parsed.title
    org, _ = await Org.objects.aget_or_create(name=org_name)

    jobs_qs = get_jobs_qs_prefetched()

    job_published = await jobs_qs.filter(
        url_external=job_parsed.url_external, is_published=True
    ).afirst()

    job_draft = await _sync_job_draft(job_parsed, org)

    for tag_field_name, tags in (await _resolve_tags_by_field(job_parsed)).items():
        await getattr(job_draft, tag_field_name).aset(tags)

    await job_draft.locations.aset(await _sync_locations(job_parsed.locations))

    if job_published is None:
        return SyncOutput(result=SyncResult.Created, pk=job_draft.pk)

    await job_published.versions.aadd(job_draft)

    job_draft = await jobs_qs.aget(pk=job_draft.pk)
    if await serialize_job_to_markdown(job_published) == await serialize_job_to_markdown(
        job_draft
    ):
        # todo !! fix: it can alast() an existing draft, override it with new values, and then can delete it - sounds as a bug.
        await job_draft.adelete()
        return SyncOutput(result=SyncResult.NotChanged, pk=job_published.pk)

    return SyncOutput(result=SyncResult.Updated, pk=job_draft.pk)


def get_jobs_qs_prefetched():
    return Job.objects.select_related("org").prefetch_related(
        "tags_skill",
        "tags_area",
        "tags_education",
        "tags_experience",
        "tags_workload",
        "tags_country_visa_sponsor",
        "locations",
    )


async def _sync_job_draft(job_parsed: JobParsed, org: Org) -> Job:
    job_defaults = dict(
        is_published=False,
        visibility=Visibility.PUBLIC,
        org=org,
        # todo ! refac: convert JobParsed to dict & spread, eg asdict()
        title=job_parsed.title,
        url_external=job_parsed.url_external,
        description=job_parsed.description,
        source_ext=job_parsed.source_ext,
        salary_min=job_parsed.salary_min,
        salary_text=job_parsed.salary_text,
        posted_at=job_parsed.posted_at,
        closes_at=job_parsed.closes_at,
    )

    # reuse Job (eg unpublished) for preserving [[JobAlert]].jobs_clicked tracking
    job_draft = (
        await Job.objects.filter(
            url_external=job_parsed.url_external,
            is_published=False,
        )
        .order_by("updated_at")
        .alast()
    )

    if job_draft:
        for field_name, value in job_defaults.items():
            setattr(job_draft, field_name, value)
        await job_draft.asave()
        return job_draft

    return await Job.objects.acreate(**job_defaults)


async def _resolve_tags_by_field(job_parsed: JobParsed) -> dict[str, list[PostTag]]:
    tags_by_field: dict[str, list[PostTag]] = {}
    for category, tag_field_name in Job.tag_category_to_field.items():
        tag_names: list[str] = getattr(job_parsed, tag_field_name)
        tags_by_field[tag_field_name] = (
            await _sync_tags(
                params_list=[TagParams(name=name) for name in tag_names],
                category=category,
            )
            if tag_names
            else []
        )
    return tags_by_field


async def _create_job_draft_is_pending_removal(job_pub: Job) -> Job:
    job_draft = await Job.objects.acreate(
        is_published=False,
        is_pending_removal=True,
        # todo ! refac: convert JobParsed to dict & spread
        title=job_pub.title,
        url_external=job_pub.url_external,
        description=job_pub.description,
        source_ext=job_pub.source_ext,
        salary_min=job_pub.salary_min,
        salary_text=job_pub.salary_text,
        posted_at=job_pub.posted_at,
        closes_at=job_pub.closes_at,
        org=job_pub.org,
        visibility=job_pub.visibility,
    )

    for tag_field_name in Job.tag_category_to_field.values():
        if tags_new := [tag async for tag in getattr(job_pub, tag_field_name).all()]:
            await getattr(job_draft, tag_field_name).aset(tags_new)

    if locations := [loc async for loc in job_pub.locations.all()]:
        await job_draft.locations.aset(locations)
    return job_draft


async def _sync_locations(locs_parsed: list[LocationParsed]) -> list[JobLocation]:
    locs = []
    for loc_parsed in locs_parsed:
        loc, _ = await JobLocation.objects.aget_or_create(
            name=loc_parsed.name,
            defaults={
                "type": loc_parsed.type,
                "city": loc_parsed.city,
                "country": loc_parsed.country,
                "is_remote": loc_parsed.is_remote,
            },
        )
        locs.append(loc)
    return locs


async def _sync_tags(params_list: list[TagParams], category: TagCategory) -> list[PostTag]:
    category_obj, _ = await PostTagCategory.objects.aget_or_create(name=category.value)
    tags = []
    for tag_params in params_list:
        tag, _ = await PostTag.objects.aget_or_create(
            name=tag_params.name,
            tag_parent=None,
            defaults={"aliases": tag_params.aliases},
        )
        # #AI, #168
        # Don't aadd() a 2nd category - Airtable may list the same name under
        # multiple categories, which would pollute `limit_choices_to` pickers.
        if not await tag.categories.aexists():
            await tag.categories.aadd(category_obj)
        tags.append(tag)
    return tags


@dataclass
class TagParams:
    name: str
    aliases: list[str] = field(default_factory=list)


@dataclass
class LocationParsed:
    name: str
    type: JobLocation.LocationType
    city: str
    country: str
    is_remote: bool


def _parse_job_raw(job_raw: RecordDict) -> JobParsed:
    sentry_sdk.set_context("job_raw", dict(job_raw))

    fields = job_raw.get("fields", {})

    source_raw = fields.get(_airtable.source, "").strip()
    if source_raw not in Job.SourceExt.values:
        sentry_sdk.set_context("source", source_raw)
        sentry_sdk.capture_message("Job source not in JobSourceExt", level="error")
        source_raw = ""

    salary_min_raw = fields.get(_airtable.salary_min, "").strip()
    closes_at_raw = fields.get(_airtable.deadline, "").strip()
    posted_at_raw = fields.get(_airtable.date_added, "").strip()

    return JobParsed(
        title=fields.get(_airtable.title, "").strip(),
        url_external=fields.get(_airtable.url_external, "").strip(),
        description=fields.get(_airtable.description, "").strip(),
        org_name=fields.get(_airtable.org_name, "").strip(),
        locations=_parse_location_field(fields.get(_airtable.locations, "")),
        tags_skill=_list_split_and_strip(fields.get(_airtable.skill_sets, "")),
        tags_area=_list_split_and_strip(fields.get(_airtable.cause_areas, "")),
        tags_workload=_list_split_and_strip(fields.get(_airtable.role_type, "")),
        tags_education=_list_split_and_strip(fields.get(_airtable.education, "")),
        tags_experience=_list_split_and_strip(fields.get(_airtable.experience, "")),
        tags_country_visa_sponsor=[],
        source_ext=source_raw or None,
        salary_min=int(float(salary_min_raw.replace(",", ""))) if salary_min_raw else None,
        salary_text=fields.get(_airtable.salary_text, "").strip(),
        closes_at=datetime.strptime(closes_at_raw, "%Y-%m-%d").replace(tzinfo=UTC)
        if closes_at_raw
        else None,
        posted_at=datetime.strptime(posted_at_raw, "%B %d, %Y").replace(tzinfo=UTC)
        if posted_at_raw
        else None,
    )


@dataclass
class JobParsed:
    title: str
    url_external: str
    description: str = ""
    org_name: str = ""
    locations: list[LocationParsed] = field(default_factory=list)
    tags_skill: list[str] = field(default_factory=list)
    tags_area: list[str] = field(default_factory=list)
    tags_workload: list[str] = field(default_factory=list)
    tags_education: list[str] = field(default_factory=list)
    tags_experience: list[str] = field(default_factory=list)
    tags_country_visa_sponsor: list[str] = field(default_factory=list)
    source_ext: str | None = None
    salary_min: int | None = None
    salary_text: str = ""
    posted_at: datetime | None = None
    closes_at: datetime | None = None


class _airtable:
    title = "Job Title"
    url_external = "Job Link"
    description = "Job Description"
    org_name = "Organization"
    skill_sets = "Skill Sets"
    cause_areas = "Cause Area(s)"
    role_type = "Role Type"
    education = "Education"
    experience = "Experience"
    locations = "Location(s)"
    source = "Source"
    salary_min = "Min Salary (USD)"
    salary_text = "Salary Range"
    deadline = "Deadline"
    date_added = "Date Added"


# #quality-35% #AI
# - 28% -> 35%: proven in prod for 2 weeks.
def _parse_location_field(raw: str) -> list[LocationParsed]:
    if not raw:
        return []

    # todo ? refac: drop - dumb idea.
    # Location(s) is a quoted-CSV string: "City, Country", "City2, Country2"
    # Airtable cellFormat=string emits `", "` between entries.
    locations_raw = next(csv.reader(StringIO(raw), skipinitialspace=True), [])
    locations: list[LocationParsed] = []
    seen_countries: set[str] = set()

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
                    type=JobLocation.LocationType.REMOTE,
                    city="",
                    country=country_name,
                    is_remote=True,
                )
            )
        else:
            locations.append(
                LocationParsed(
                    name=location_raw,
                    type=JobLocation.LocationType.CITY,
                    city=city_name,
                    country=country_name,
                    is_remote=False,
                )
            )
            if country_name not in seen_countries:
                seen_countries.add(country_name)
                locations.append(
                    LocationParsed(
                        name=country_name,
                        type=JobLocation.LocationType.COUNTRY,
                        city="",
                        country=country_name,
                        is_remote=False,
                    )
                )

    return locations


def _list_split_and_strip(str_list_raw: str) -> list[str]:
    if not str_list_raw:
        return []
    return [str_raw.strip() for str_raw in str_list_raw.split(",") if str_raw.strip()]
