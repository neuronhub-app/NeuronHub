from typing import Literal

from django_tasks import task
from sentry_sdk import monitor

from neuronhub.apps.importer.services.hackernews import CategoryHackerNews
from neuronhub.apps.importer.services.hackernews import ImporterHackerNews
from neuronhub.apps.tests.services.db_stubs_repopulate import _algolia_reindex
from neuronhub.apps.tests.services.db_stubs_repopulate import _disable_auto_indexing


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
        with _disable_auto_indexing():
            importer = ImporterHackerNews(is_use_cache=is_use_cache)
            await importer.import_posts(category=CategoryHackerNews(category), limit=limit)

        await _algolia_reindex()
