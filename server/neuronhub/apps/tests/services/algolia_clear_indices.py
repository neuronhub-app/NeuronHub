from asgiref.sync import sync_to_async
from django.conf import settings


async def algolia_clear_indices() -> None:
    """
    Drops records the DB can't name anymore - eg every `mise dev:db:e2e:rm` orphans
    the prev run's records, which then inflate all following e2e Algolia counts.
    """
    assert settings.DJANGO_ENV.is_dev(), (
        f"Wipes whole indices, not just the ids the DB knows - got {settings.DJANGO_ENV}"
    )
    if settings.ALGOLIA["IS_ENABLED"]:
        await _algolia_clear_indices()


@sync_to_async
def _algolia_clear_indices() -> None:
    from algoliasearch_django import algolia_engine

    for model in algolia_engine.get_registered_models():
        index_name = algolia_engine.get_adapter(model).index_name
        cleared = algolia_engine.client.clear_objects(index_name=index_name)
        algolia_engine.client.wait_for_task(index_name=index_name, task_id=cleared.task_id)
