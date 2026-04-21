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


async def publish_job_versions(draft_ids: list[int]) -> None:

    with disable_auto_indexing_if_enabled():
        async for job_draft in Job.objects.filter(id__in=draft_ids, is_published=False):
            if job_draft.is_pending_removal:
                await _job_delete_published_and_draft(job_draft)
            else:
                await _job_create_or_update(job_draft)

    if settings.ALGOLIA["IS_ENABLED"]:
        pass
        # needs review & testing
        #
        # await _algolia_reindex_by_ids_wo_wait(
        #     ids_created=ids_published.created,
        #     ids_updated=ids_published.updated,
        #     ids_removed=ids_deleted,
        # )


async def _job_delete_published_and_draft(job_draft: Job) -> list[int]:
    ids_deleted: list[int] = []

    async for job_pub in job_draft.version_of.filter(is_published=True):
        ids_deleted.append(job_pub.pk)
        await job_pub.adelete()

    await job_draft.adelete()

    return ids_deleted


async def _job_create_or_update(job_draft: Job):
    ids_created: list[int] = []
    ids_updated: list[int] = []

    is_updated = False
    async for job_pub in job_draft.version_of.filter(is_published=True):
        is_updated = True
        await job_pub.adelete()  # [slug, is_published=True] must be unique

    if is_updated:
        ids_updated.append(job_draft.pk)
    else:
        ids_created.append(job_draft.pk)

    if is_slug_dups_exist := await Job.objects.filter(
        slug=job_draft.slug, is_published=True
    ).aexists():
        job_draft.slug = f"{job_draft.slug}-{job_draft.pk}"

    job_draft.is_published = True
    await job_draft.asave()

    return Published(created=ids_created, updated=ids_updated)


@dataclass
class Published:
    created: list[int] = field(default_factory=list)
    updated: list[int] = field(default_factory=list)


@sync_to_async
def _algolia_reindex_by_ids_wo_wait(
    ids_updated: list[int],
    ids_removed: list[int],
    ids_created: list[int],
):
    from algoliasearch_django import algolia_engine

    adapter = algolia_engine.get_adapter(model=Job)

    algolia_engine.client.delete_objects(
        index_name=adapter.index_name,
        object_ids=ids_removed,
        wait_for_tasks=False,
    )

    jobs_updated: list[dict] = []
    for job in get_jobs_qs_prefetched().filter(id__in=ids_updated):
        if adapter._should_index(job):
            jobs_updated.append(adapter.get_raw_record(job))
    algolia_engine.client.partial_update_objects(
        index_name=adapter.index_name,
        objects=jobs_updated,
        wait_for_tasks=False,
    )

    jobs_created: list[dict] = []
    for job in get_jobs_qs_prefetched().filter(id__in=ids_created):
        if adapter._should_index(job):
            jobs_created.append(adapter.get_raw_record(job))
    algolia_engine.client.save_objects(
        index_name=adapter.index_name,
        objects=jobs_created,
        wait_for_tasks=False,
    )
