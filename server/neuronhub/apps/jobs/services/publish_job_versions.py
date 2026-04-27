from dataclasses import asdict
from dataclasses import dataclass
from dataclasses import field
from typing import Literal

import sentry_sdk
from asgiref.sync import sync_to_async
from django.conf import settings

from neuronhub.apps.algolia.services.disable_auto_indexing_if_enabled import (
    disable_auto_indexing_if_enabled,
)
from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.services.airtable_sync_jobs import get_jobs_qs_prefetched


@dataclass
class JobIds:
    created: list[int] = field(default_factory=list)
    updated: list[int] = field(default_factory=list)
    deleted: list[int] = field(default_factory=list)


async def publish_job_versions(draft_ids: list[int]):
    sentry_sdk.set_context("draft_ids", dict(ids=draft_ids))

    with disable_auto_indexing_if_enabled():
        job_ids = await _publish_changes_to_db(draft_ids)

    sentry_sdk.set_context("job_ids", asdict(job_ids))

    if settings.ALGOLIA["IS_ENABLED"]:
        await _publish_changes_to_algolia(job_ids)


async def _publish_changes_to_db(draft_ids: list[int]) -> JobIds:
    job_ids = JobIds()

    result_del = await _publish_deletion(draft_ids)
    job_ids.deleted += result_del.deleted

    result_new = await _publish_update_or_create(draft_ids)
    job_ids.updated += result_new.updated
    job_ids.created += result_new.created

    await _handle_invalid_drafts(draft_ids)

    return job_ids


async def _publish_deletion(draft_ids: list[int]) -> JobIds:
    job_ids = JobIds()

    jobs_draft = Job.objects.filter(id__in=draft_ids, is_pending_removal=True)
    jobs_pub = Job.objects.filter(versions__in=jobs_draft, is_published=True).distinct()

    job_ids.deleted = [id async for id in jobs_pub.values_list("id", flat=True)]

    async for job_pub in jobs_pub:  # for django-simple-history, JIC
        try:
            await job_pub.adelete()
        except Exception:
            sentry_sdk.capture_exception()

    try:
        await jobs_draft.adelete()
    except Exception:
        sentry_sdk.capture_exception()

    return job_ids


async def _publish_update_or_create(draft_ids: list[int]) -> JobIds:
    job_ids = JobIds()

    async for job_updated_draft in Job.objects.filter(
        id__in=draft_ids,
        is_pending_removal=False,
        is_published=False,
        version_of__is_published=True,
    ).distinct():
        try:
            async for published in job_updated_draft.version_of.filter(is_published=True):
                job_updated_draft.slug = published.slug  # must be manual
                await published.adelete()
            job_updated_draft.is_published = True
            await job_updated_draft.asave()

            job_ids.updated.append(job_updated_draft.id)
        except Exception:
            sentry_sdk.capture_exception()

    drafts_to_create = Job.objects.filter(
        id__in=draft_ids,
        is_pending_removal=False,
        is_published=False,
        version_of__isnull=True,
    )
    try:
        job_ids.created = [id async for id in drafts_to_create.values_list("id", flat=True)]
        await drafts_to_create.aupdate(is_published=True)
    except Exception:
        sentry_sdk.capture_exception()

    return job_ids


@sync_to_async
def _publish_changes_to_algolia(job_ids: JobIds):
    from algoliasearch_django import algolia_engine

    adapter = algolia_engine.get_adapter(model=Job)
    is_await_algolia_http_response = False

    algolia_engine.client.delete_objects(
        index_name=adapter.index_name,
        object_ids=job_ids.deleted,
        wait_for_tasks=is_await_algolia_http_response,
    )

    for algolia_params in [
        AlgoliaParams(ids=job_ids.updated, method="partial_update_objects"),
        AlgoliaParams(ids=job_ids.created, method="save_objects"),
    ]:
        jobs_changed: list[dict] = []
        for job in get_jobs_qs_prefetched().filter(id__in=algolia_params.ids):
            if adapter._should_index(job):
                jobs_changed.append(adapter.get_raw_record(job))

        getattr(algolia_engine.client, algolia_params.method)(
            index_name=adapter.index_name,
            objects=jobs_changed,
            wait_for_tasks=is_await_algolia_http_response,
        )


@dataclass
class AlgoliaParams:
    method: Literal["partial_update_objects", "save_objects"]
    ids: list[int]


async def _handle_invalid_drafts(draft_ids: list[int]):
    """
    #AI

    Drafts that matched neither deletion, update, nor create branch -
    eg `version_of` points at a non-published peer. Unreachable via sync,
    but possible from hand-edited data -> surface instead of silently skipping.
    """
    if draft_unhandled_ids := [
        id
        async for id in Job.objects.filter(
            id__in=draft_ids,
            is_published=False,
            is_pending_removal=False,
        ).values_list("id", flat=True)
    ]:
        sentry_sdk.set_context("unhandled_ids", dict(ids=draft_unhandled_ids))
        sentry_sdk.capture_message("Job drafts fell through create/update/delete", "error")
