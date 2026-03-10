import logging

from asgiref.sync import sync_to_async
from django.conf import settings

from neuronhub.apps.jobs.models import Job


logger = logging.getLogger(__name__)


async def publish_job_versions(draft_ids: list[int]) -> None:
    job_drafts = Job.objects.filter(id__in=draft_ids, is_published=False).select_related("org")

    ids_approved: list[int] = []

    async for job_draft in job_drafts:
        if job_old := await Job.objects.filter(slug=job_draft.slug, is_published=True).afirst():
            await job_old.adelete()

        job_draft.is_published = True
        await job_draft.asave()

        ids_approved.append(job_draft.pk)

        await job_draft.version_of.aclear()  # todo ! refac: #AI-slop - why. and why job_old isn't using the same if this is what i think this is.

    if ids_approved and settings.ALGOLIA["IS_ENABLED"]:
        await sync_to_async(_algolia_reindex)(ids_approved)


def _algolia_reindex(ids_job: list[int]) -> None:
    from algoliasearch_django import algolia_engine

    adapter = algolia_engine.get_adapter(model=Job)
    batch: list[dict] = []
    for job in Job.objects.filter(id__in=ids_job):
        if adapter._should_index(job):
            batch.append(adapter.get_raw_record(job))

    algolia_engine.client.partial_update_objects(
        index_name=adapter.index_name,
        objects=batch,
        wait_for_tasks=False,
    )
