import logging
from enum import Enum

from asgiref.sync import sync_to_async
from django.conf import settings

from neuronhub.apps.jobs.index import setup_virtual_replica_sorted_by_closes_at
from neuronhub.apps.jobs.models import Job
from neuronhub.apps.posts.index import setup_virtual_replica_sorted_by_votes
from neuronhub.apps.posts.models import Post
from neuronhub.apps.profiles.models import Profile


logger = logging.Logger(__name__)


class AlgoliaModel(Enum):
    Profile = "profile"
    Job = "job"
    Post = "post"


async def algolia_reindex(models: list[AlgoliaModel] | None = None, limit: int | None = None):
    await sync_to_async(algolia_reindex_sync)(models=models, limit=limit)


def algolia_reindex_sync(models: list[AlgoliaModel] | None = None, limit: int | None = None):
    if not settings.ALGOLIA["IS_ENABLED"]:
        logger.debug("Skipping reindex - Algolia is disabled")
        return

    if limit:
        for model in models or list(AlgoliaModel):
            _partial_update_all(model=model, limit=limit)
        return

    from algoliasearch_django import reindex_all

    for model in models or list(AlgoliaModel):
        match model:
            case AlgoliaModel.Profile:
                reindex_all(model=Profile)
            case AlgoliaModel.Job:
                reindex_all(model=Job)
                setup_virtual_replica_sorted_by_closes_at()
            case AlgoliaModel.Post:
                reindex_all(model=Post)
                setup_virtual_replica_sorted_by_votes()


def _partial_update_all(model: AlgoliaModel, limit: int):
    from algoliasearch_django import algolia_engine

    django_model = {
        AlgoliaModel.Profile: Profile,
        AlgoliaModel.Job: Job,
        AlgoliaModel.Post: Post,
    }[model]
    adapter = algolia_engine.get_adapter(model=django_model)

    qs = adapter.get_queryset() if callable(adapter.get_queryset) else django_model.objects.all()

    batch: list[dict] = []
    for instance in qs[:limit]:
        if not adapter._should_index(instance):
            continue

        batch.append(adapter.get_raw_record(instance))

        if is_batch_reset_needed := len(batch) >= 1000:
            algolia_engine.client.partial_update_objects(
                index_name=adapter.index_name,
                objects=batch,
                wait_for_tasks=True,
            )
            batch = []

    if batch:
        algolia_engine.client.partial_update_objects(
            index_name=adapter.index_name,
            objects=batch,
            wait_for_tasks=True,
        )
