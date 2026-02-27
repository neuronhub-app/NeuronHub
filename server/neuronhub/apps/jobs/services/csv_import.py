"""
#AI
"""

import csv
from dataclasses import dataclass
from datetime import UTC
from datetime import datetime
from pathlib import Path

from asgiref.sync import sync_to_async
from django.conf import settings

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.jobs.models import Job
from neuronhub.apps.orgs.models import Org
from neuronhub.apps.posts.graphql.types_lazy import TagCategoryEnum
from neuronhub.apps.posts.models import PostTag
from neuronhub.apps.posts.models import PostTagCategory
from neuronhub.apps.tests.services.db_stubs_repopulate import _disable_auto_indexing


@dataclass
class CsvSyncStats:
    created: int = 0
    updated: int = 0


async def csv_import_jobs(
    csv_path: Path,
    limit: int | None = None,
    is_reindex_algolia: bool = True,
) -> CsvSyncStats:
    stats = CsvSyncStats()

    with _disable_auto_indexing():
        jobs_dict = _parse_jobs_csv(csv_path)
        for job_dict in jobs_dict[:limit] if limit else jobs_dict:
            if not job_dict:
                continue

            tags_by_field_name = {}
            for category in TagCategoryEnum:
                field_name = f"tags_{category.value}"
                tags_by_field_name[field_name] = await _get_or_create_tags_by_category(
                    names=_list_split_and_strip(job_dict.pop(field_name)),
                    category=category,
                )

            org_name = job_dict.pop("org_name", "").replace('"', "")
            is_broken_job_org = not org_name
            if is_broken_job_org:
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

            for field_name, tags in tags_by_field_name.items():
                await getattr(job, field_name).aset(tags)

    if settings.ALGOLIA["IS_ENABLED"] and is_reindex_algolia:
        from algoliasearch_django import reindex_all

        await sync_to_async(reindex_all)(Job)

    return stats


async def _get_or_create_tags_by_category(
    names: list[str],
    category: TagCategoryEnum,
) -> list[PostTag]:
    category_obj, _ = await PostTagCategory.objects.aget_or_create(name=category.value)
    tags = []
    for name in names:
        tag, _ = await PostTag.objects.aget_or_create(name=name)
        await tag.categories.aadd(category_obj)
        tags.append(tag)
    return tags


def _parse_jobs_csv(csv_path: Path) -> list[dict]:
    with open(csv_path, newline="", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)
        job_rows = list(reader)

    jobs_dict = []
    for row in job_rows:
        job = {}

        for name_csv, name_django in columns_csv_to_django.items():
            job[name_django] = row.get(name_csv, "").strip()

        job["country"] = _list_split_and_strip(job.get("country", ""))
        job["city"] = _list_split_and_strip(job.get("city", ""))

        job["is_remote"] = "Remote" == row.get("Remote? ", "").strip()

        if salary_raw := row.get("Minimum Salary", ""):
            job["salary_min"] = int(float(salary_raw))

        if closes_at_raw := row.get("Deadline", ""):
            job["closes_at"] = datetime.strptime(closes_at_raw, "%Y-%m-%d").replace(
                # todo ? fix: use TZ of .city / .country
                tzinfo=UTC
            )

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


columns_csv_to_django = {
    "Job Title": "title",
    "Organization": "org_name",
    "Job Link": "url_external",
    "Country": "country",
    "City / State": "city",
    "Cause Area(s)": "tags_area",
    "Role Types": "tags_workload",
    "Education": "tags_education",
    "Experience": "tags_experience",
    "Skill Sets": "tags_skill",
}
