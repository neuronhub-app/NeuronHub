import asyncio
import logging
from typing import TypedDict
from typing import Unpack

from django.core.management import BaseCommand

from neuronhub.apps.importer.services.hackernews import import_posts, PostCategoryHN


logger = logging.getLogger(__name__)


class Options(TypedDict):
    pass


class Command(BaseCommand):
    def handle(self, *args, **options: Unpack[Options]):
        try:
            asyncio.run(import_posts(category=PostCategoryHN.Top))
            logger.info("HN Top imported")
        except KeyboardInterrupt:
            logger.info("Interrupted")
