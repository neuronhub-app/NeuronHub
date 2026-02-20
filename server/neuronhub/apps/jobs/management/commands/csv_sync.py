from pathlib import Path

from asgiref.sync import async_to_sync
from django.core.management.base import BaseCommand

from neuronhub.apps.jobs.services.csv_import import csv_import_jobs
from neuronhub.apps.tests.services.db_stubs_repopulate import _disable_auto_indexing


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            "--csv",
            type=Path,
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
        )
        parser.add_argument(
            "--limit",
            type=int,
        )

    def handle(self, *args, csv: Path, dry_run: bool, limit: int | None, **options):
        if dry_run:
            self.stdout.write("DRY RUN - no changes will be made")

        with _disable_auto_indexing():
            stats = async_to_sync(csv_import_jobs)(csv, limit=limit, is_reindex_algolia=False)

        self.stdout.write(f"Created:   {stats.created}")
        self.stdout.write(f"Updated:   {stats.updated}")
