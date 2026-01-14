from django_tasks import task

from neuronhub.apps.importer.services.hackernews import CategoryHackerNews
from neuronhub.apps.importer.services.hackernews import ImporterHackerNews


@task()
async def import_post_hn(id_ext: int):
    importer = ImporterHackerNews(is_use_cache=True)
    await importer.import_post(id_ext=id_ext)


@task()
async def import_hn_posts(
    category: CategoryHackerNews = CategoryHackerNews.Top,
    limit: int = 60,
    is_use_cache: bool = False,
):
    importer = ImporterHackerNews(is_use_cache=is_use_cache)
    await importer.import_posts(category=category, limit=limit)
