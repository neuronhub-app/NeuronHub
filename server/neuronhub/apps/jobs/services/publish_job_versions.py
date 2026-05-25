from dataclasses import asdict
from dataclasses import dataclass
from dataclasses import field

import sentry_sdk
from django.utils import timezone

from neuronhub.apps.algolia.services.algolia_reindex_partial import AlgoliaChangedIds
from neuronhub.apps.algolia.services.algolia_reindex_partial import algolia_reindex_partial
from neuronhub.apps.algolia.services.disable_auto_indexing_if_enabled import (
    disable_auto_indexing_if_enabled,
)
from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.services.get_jobs_public_from_ram import clear_jobs_public_ram_cache


# todo ! refac: drop and use [[AlgoliaChangedIds]]
@dataclass
class JobIds:
    created: list[ID] = field(default_factory=list)
    updated: list[ID] = field(default_factory=list)
    deleted: list[ID] = field(default_factory=list)


type ID = int


async def publish_job_versions(draft_ids: list[ID]):
    sentry_sdk.set_context("draft_ids", dict(ids=draft_ids))

    with disable_auto_indexing_if_enabled():
        ids = await _publish_changes_to_db(draft_ids)

    sentry_sdk.set_context("changes", asdict(ids))

    await algolia_reindex_partial(
        AlgoliaChangedIds(
            model=Job,
            created=ids.created,
            updated=ids.updated,
            deleted=ids.deleted,
        ),
    )

    # non-bilk for django-simple-history, JIC
    async for job_pub in Job.objects.filter(id__in=ids.deleted):
        try:
            await job_pub.adelete()
        except Exception:
            sentry_sdk.capture_exception()

    clear_jobs_public_ram_cache()


async def _publish_changes_to_db(draft_ids: list[ID]) -> JobIds:
    ids = JobIds()

    result_del = await _publish_deletion(draft_ids)
    ids.deleted += result_del.deleted

    result_new = await _publish_update_or_create(draft_ids)
    ids.updated += result_new.updated
    ids.created += result_new.created

    await _handle_invalid_drafts(draft_ids)

    return ids


async def _publish_deletion(draft_ids: list[ID]) -> JobIds:
    ids = JobIds()

    jobs_draft = Job.objects.filter(id__in=draft_ids, is_pending_removal=True)
    jobs_pub = Job.objects.filter(versions__in=jobs_draft, is_published=True).distinct()

    ids.deleted = [id async for id in jobs_pub.values_list("id", flat=True)]

    try:
        await jobs_draft.adelete()
    except Exception:
        sentry_sdk.capture_exception()

    return ids


async def _publish_update_or_create(draft_ids: list[ID]) -> JobIds:
    ids = JobIds()

    async for job_updated_draft in Job.objects.filter(
        id__in=draft_ids,
        is_pending_removal=False,
        is_published=False,
        version_of__is_published=True,
    ).distinct():
        try:
            async for published in job_updated_draft.version_of.filter(
                is_published=True
            ).order_by("published_at"):
                job_updated_draft.slug = published.slug  # must be manual
                job_updated_draft.published_at = published.published_at
                await published.adelete()

            job_updated_draft.is_published = True
            await job_updated_draft.asave()

            ids.updated.append(job_updated_draft.id)
        except Exception:
            sentry_sdk.capture_exception()

    drafts_to_create = Job.objects.filter(
        id__in=draft_ids,
        is_pending_removal=False,
        is_published=False,
        version_of__isnull=True,
    )
    try:
        ids.created = [id async for id in drafts_to_create.values_list("id", flat=True)]
        await drafts_to_create.aupdate(is_published=True, published_at=timezone.now())
    except Exception:
        sentry_sdk.capture_exception()

    return ids


async def _handle_invalid_drafts(draft_ids: list[ID]):
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
