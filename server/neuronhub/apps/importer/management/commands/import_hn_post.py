import asyncio
import logging
from typing import TypedDict
from typing import Unpack

from django.core.management import BaseCommand

from neuronhub.apps.importer.services.hackernews import ImporterHackerNews, ID

logger = logging.getLogger(__name__)


class Options(TypedDict):
    id: ID


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--id", type=int, required=True, help="HN ID to import")

    def handle(self, *args, **options: Unpack[Options]):
        try:
            importer = ImporterHackerNews(is_use_cache=True)
            asyncio.run(importer.import_post(id_ext=options["id"]))
            logger.info(f"HN Post {options['id']} imported")
        except KeyboardInterrupt:
            logger.info("Interrupted")
