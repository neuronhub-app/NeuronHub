import logging
from dataclasses import dataclass
from dataclasses import field

from asgiref.sync import sync_to_async
from django.conf import settings

from neuronhub.apps.algolia.services.disable_auto_indexing_if_enabled import (
    disable_auto_indexing_if_enabled,
)
from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.services.airtable_sync_jobs import get_jobs_qs_prefetched


logger = logging.getLogger(__name__)


@dataclass
class JobIds:
    created: list[int] = field(default_factory=list)
    updated: list[int] = field(default_factory=list)
    deleted: list[int] = field(default_factory=list)


async def publish_job_versions(draft_ids: list[int]):
    with disable_auto_indexing_if_enabled():
        job_ids = await _publish_changes_to_db(draft_ids)

    if settings.ALGOLIA["IS_ENABLED"]:
        await _publish_changes_to_algolia(job_ids)


async def _publish_changes_to_db(draft_ids: list[int]) -> JobIds:
    job_ids = JobIds()

    result_del = await _publish_deletion(draft_ids)
    job_ids.deleted += result_del.deleted

    result_new = await _publish_update_or_create(draft_ids)
    job_ids.updated += result_new.updated
    job_ids.created += result_new.created

    return job_ids


async def _publish_deletion(draft_ids: list[int]) -> JobIds:
    job_ids = JobIds()

    jobs_draft = Job.objects.filter(id__in=draft_ids, is_pending_removal=True)
    jobs_pub = Job.objects.filter(versions__in=jobs_draft, is_published=True).distinct()

    job_ids.deleted = [pk async for pk in jobs_pub.values_list("id", flat=True)]

    for job_pub in jobs_pub:  # for django-simple-history, JIC
        await job_pub.adelete()

    await jobs_draft.adelete()

    return job_ids


async def _publish_update_or_create(draft_ids: list[int]) -> JobIds:
    job_ids = JobIds()

    async for job_updated_draft in Job.objects.filter(
        id__in=draft_ids,
        is_pending_removal=False,
        is_published=False,
        version_of__is_published=True,
    ).distinct():
        async for published in job_updated_draft.version_of.filter(is_published=True):
            job_updated_draft.slug = published.slug  # must be manual
            await published.adelete()
        job_updated_draft.is_published = True
        await job_updated_draft.asave()

        job_ids.updated.append(job_updated_draft.pk)

    drafts_to_create = Job.objects.filter(
        id__in=draft_ids,
        is_pending_removal=False,
        is_published=False,
        version_of__isnull=True,
    )
    job_ids.created = [pk async for pk in drafts_to_create.values_list("id", flat=True)]
    await drafts_to_create.aupdate(is_published=True)

    return job_ids


@sync_to_async
def _publish_changes_to_algolia(job_ids: JobIds):
    from algoliasearch_django import algolia_engine

    adapter = algolia_engine.get_adapter(model=Job)

    algolia_engine.client.delete_objects(
        index_name=adapter.index_name,
        object_ids=job_ids.deleted,
        wait_for_tasks=False,
    )

    jobs_updated: list[dict] = []
    for job in get_jobs_qs_prefetched().filter(id__in=job_ids.updated):
        if adapter._should_index(job):
            jobs_updated.append(adapter.get_raw_record(job))
    algolia_engine.client.partial_update_objects(
        index_name=adapter.index_name,
        objects=jobs_updated,
        wait_for_tasks=False,
    )

    jobs_created: list[dict] = []
    for job in get_jobs_qs_prefetched().filter(id__in=job_ids.created):
        if adapter._should_index(job):
            jobs_created.append(adapter.get_raw_record(job))
    algolia_engine.client.save_objects(
        index_name=adapter.index_name,
        objects=jobs_created,
        wait_for_tasks=False,
    )
