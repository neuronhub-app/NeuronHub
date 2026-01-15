import logging
from typing import Literal
from typing import TypedDict
from typing import Unpack

from django.core.management import BaseCommand

from neuronhub.apps.importer.services.hackernews import CategoryHackerNews
from neuronhub.apps.importer.tasks import import_hn_posts


logger = logging.getLogger(__name__)


class Options(TypedDict):
    category: Literal["top", "best"]
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
            logger.info("Import HN: starting")

            import_hn_posts.call(  # type: ignore[unused-coroutine] #bad-infer
                category=options["category"],
                limit=options["limit"],
                is_use_cache=options["is_use_cache"],
            )

            logger.info("Import HN: completed")
        except KeyboardInterrupt:
            logger.info("Interrupted")
