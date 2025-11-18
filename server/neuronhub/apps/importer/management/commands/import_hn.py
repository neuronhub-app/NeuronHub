import asyncio
import logging
from typing import TypedDict, Literal
from typing import Unpack

from django.core.management import BaseCommand

from neuronhub.apps.importer.services.hackernews import CategoryHackerNews, ImporterHackerNews

logger = logging.getLogger(__name__)


class Options(TypedDict):
    category: Literal[CategoryHackerNews.Top, CategoryHackerNews.Best]
    limit: int | None


class Command(BaseCommand):
    def handle(self, *args, **options: Unpack[Options]):
        try:
            limit = options.get("limit", None)
            category = options["category"]
            logger.info(f"Import HN: starting ${category}, limit={limit}")

            importer = ImporterHackerNews(is_use_cache=True)
            asyncio.run(importer.import_posts(category=category, posts_limit=limit))

            logger.info(f"Import HN: completed ${category}")
        except KeyboardInterrupt:
            logger.info("Interrupted")
