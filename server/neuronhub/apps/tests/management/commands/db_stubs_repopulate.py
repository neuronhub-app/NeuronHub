import asyncio
import logging

from django.conf import settings
from django.core.management import BaseCommand
from django.core.management import CommandError

from neuronhub.apps.tests.services.db_stubs_repopulate import db_stubs_repopulate


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    def handle(self, *args, **options):
        if not settings.DJANGO_ENV.is_dev():
            raise CommandError(
                f"Drops every table and clears the Algolia indices - got {settings.DJANGO_ENV}"
            )

        try:
            asyncio.run(db_stubs_repopulate())
            logger.info("Database stubs repopulated successfully")
        except KeyboardInterrupt:
            logger.info("Interrupted")
