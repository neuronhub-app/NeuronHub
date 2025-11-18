import asyncio
import logging
from typing import TypedDict, Literal
from typing import Unpack

from django.core.management import BaseCommand

from neuronhub.apps.importer.services.hackernews import CategoryHackerNews, ImporterHackerNews

logger = logging.getLogger(__name__)


class Options(TypedDict):
    category: Literal[CategoryHackerNews.Top, CategoryHackerNews.Best]
    limit: int
    is_use_cache: bool


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            "--category", type=CategoryHackerNews, required=True, default=CategoryHackerNews.Top
        )
        parser.add_argument("--limit", type=int, required=False, default=30)
        parser.add_argument("--is_use_cache", type=bool, required=False, default=False)

    def handle(self, *args, **options: Unpack[Options]):
        try:
            category = options["category"]
            limit = options["limit"]
            is_use_cache = options["is_use_cache"]

            logger.info(f"Import HN: starting ${category}, limit={limit}")

            importer = ImporterHackerNews(is_use_cache=is_use_cache)
            asyncio.run(importer.import_posts(category=category, posts_limit=limit))

            logger.info(f"Import HN: completed ${category}")
        except KeyboardInterrupt:
            logger.info("Interrupted")
