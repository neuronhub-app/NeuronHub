import asyncio
import logging
from typing import TypedDict
from typing import Unpack

from django.core.management import BaseCommand

from neuronhub.apps.db.services.db_stubs_repopulate import db_stubs_repopulate


logger = logging.getLogger(__name__)


class Options(TypedDict):
    is_delete_tools: bool
    is_delete_orgs: bool
    is_delete_users: bool


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            "--is_delete_tools",
            action="store_true",
            default=True,
        )
        parser.add_argument(
            "--is_delete_orgs",
            action="store_true",
            default=False,
        )
        parser.add_argument(
            "--is_delete_users",
            action="store_true",
            default=False,
        )

    def handle(self, *args, **options: Unpack[Options]):
        try:
            asyncio.run(
                db_stubs_repopulate(
                    is_delete_tools=options["is_delete_tools"],
                    is_delete_users=options["is_delete_users"],
                    is_delete_orgs=options["is_delete_orgs"],
                )
            )
            logger.info("Database stubs repopulated successfully")
        except KeyboardInterrupt:
            logger.info("Interrupted")
