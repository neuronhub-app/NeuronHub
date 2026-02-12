from pathlib import Path

from algoliasearch_django import reindex_all
from django.conf import settings
from django.core.management.base import BaseCommand

from neuronhub.apps.profiles.models import Profile
from neuronhub.apps.profiles.services.csv_import_optimized import csv_optimize_and_import
from neuronhub.apps.tests.services.db_stubs_repopulate import _disable_auto_indexing


class Command(BaseCommand):
    help = "Sync EAG CSV to db"

    def add_arguments(self, parser):
        parser.add_argument(
            "--csv",
            type=Path,
            default=settings.CONF_CONFIG.eag_csv_path,
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
        )

    def handle(self, *args, csv: Path, dry_run: bool, **options):
        if dry_run:
            self.stdout.write("DRY RUN - no changes will be made")

        with _disable_auto_indexing():
            stats = csv_optimize_and_import(csv)

        reindex_all(Profile)

        self.stdout.write(f"Created:   {stats.created}")
        self.stdout.write(f"Updated:   {stats.updated}")
        self.stdout.write(f"Unchanged: {stats.unchanged}")
        self.stdout.write(f"Deleted:   {stats.deleted}")
        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(f"Need LLM processing: {stats.needs_processing_count}")
        )
