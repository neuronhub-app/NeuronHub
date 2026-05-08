import asyncio
import logging

from django.core.management import BaseCommand

from neuronhub.apps.tests.services.db_stubs_repopulate import db_stubs_repopulate


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def handle(self, *args, **options):
        try:
            asyncio.run(db_stubs_repopulate())
            logger.info("Database stubs repopulated successfully")
        except KeyboardInterrupt:
            logger.info("Interrupted")
