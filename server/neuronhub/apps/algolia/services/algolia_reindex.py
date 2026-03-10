import logging
from enum import Enum

from asgiref.sync import async_to_sync
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


async def algolia_reindex(models: list[AlgoliaModel] | None = None):
    if not settings.ALGOLIA["IS_ENABLED"]:
        logger.debug("Skipping reindex - Algolia is disabled")
        return

    from algoliasearch_django import reindex_all

    for model in models or list(AlgoliaModel):
        match model:
            case AlgoliaModel.Profile:
                await sync_to_async(reindex_all)(model=Profile)
            case AlgoliaModel.Job:
                await sync_to_async(reindex_all)(model=Job)
                await sync_to_async(setup_virtual_replica_sorted_by_closes_at)()
            case AlgoliaModel.Post:
                await sync_to_async(reindex_all)(model=Post)
                await sync_to_async(setup_virtual_replica_sorted_by_votes)()


def algolia_reindex_sync(model: AlgoliaModel):
    async_to_sync(algolia_reindex)(models=[model])
