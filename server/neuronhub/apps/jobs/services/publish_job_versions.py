import logging

from asgiref.sync import sync_to_async
from django.conf import settings

from neuronhub.apps.jobs.models import Job


logger = logging.getLogger(__name__)


async def publish_job_versions(draft_ids: list[int]) -> None:
    job_drafts = Job.objects.filter(id__in=draft_ids, is_published=False).select_related("org")

    ids_approved: list[int] = []

    async for job_draft in job_drafts:
        if job_draft.is_pending_removal:
            if job_old := await job_draft.version_of.afirst():
                await job_old.adelete()
            await job_draft.adelete()
            continue

        if job_old := await job_draft.version_of.afirst():
            slug_old = job_old.slug
            await job_old.adelete()
            job_draft.slug = slug_old

        job_draft.is_published = True

        await job_draft.asave(update_fields=["is_published", "slug"])

        ids_approved.append(job_draft.pk)

    if ids_approved and settings.ALGOLIA["IS_ENABLED"]:
        await _algolia_reindex_by_ids_wo_wait(ids_approved)


@sync_to_async
def _algolia_reindex_by_ids_wo_wait(ids_job: list[int]):
    from algoliasearch_django import algolia_engine

    adapter = algolia_engine.get_adapter(model=Job)
    jobs_batch: list[dict] = []
    for job in Job.objects.filter(id__in=ids_job):
        if adapter._should_index(job):
            jobs_batch.append(adapter.get_raw_record(job))

    algolia_engine.client.partial_update_objects(
        index_name=adapter.index_name,
        objects=jobs_batch,
        wait_for_tasks=False,
    )
