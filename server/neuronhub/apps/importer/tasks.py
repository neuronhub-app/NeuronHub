from typing import Literal

from django_tasks import task
from sentry_sdk import monitor

from neuronhub.apps.algolia.services.algolia_reindex import AlgoliaModel
from neuronhub.apps.algolia.services.algolia_reindex import algolia_reindex
from neuronhub.apps.algolia.services.disable_auto_indexing_if_enabled import (
    disable_auto_indexing_if_enabled,
)
from neuronhub.apps.importer.services.hackernews import CategoryHackerNews
from neuronhub.apps.importer.services.hackernews import ImporterHackerNews


@task()
async def import_hn_post(id_external: int):
    importer = ImporterHackerNews(is_use_cache=True)
    await importer.import_post(id_ext=id_external)


@task()
async def import_hn_posts(
    category: Literal["best", "top"] | str,
    limit: int = 40,
    is_use_cache: bool = False,
):
    with monitor(
        monitor_slug=f"import_hn_posts_{category}",
        monitor_config={
            "schedule": {"type": "interval", "value": 40, "unit": "minute"},
            "failure_issue_threshold": 3,
            "recovery_threshold": 2,
            # in minutes
            "max_runtime": 40,
            "checkin_margin": 10,  # aka "Grace Period"
        },
    ):
        with disable_auto_indexing_if_enabled():
            importer = ImporterHackerNews(is_use_cache=is_use_cache)
            await importer.import_posts(category=CategoryHackerNews(category), limit=limit)

        await algolia_reindex(models=[AlgoliaModel.Profile])
