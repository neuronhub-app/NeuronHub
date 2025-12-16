from django_tasks import task

from neuronhub.apps.importer.services.hackernews import ImporterHackerNews


@task()
async def import_post_hn(id_ext: int):
    importer = ImporterHackerNews(is_use_cache=True)
    await importer.import_post(id_ext=id_ext)
