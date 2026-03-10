from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from neuronhub.apps.algolia.services.disable_auto_indexing_if_enabled import (
    disable_auto_indexing_if_enabled,
)
from neuronhub.apps.profiles.services.csv_import_optimized import csv_optimize_and_import


class Command(BaseCommand):
    help = "Sync EAG CSV to db"

    def add_arguments(self, parser):
        parser.add_argument(
            "--csv",
            type=Path,
            default=settings.CONF_CONFIG.eag_csv_path,
        )
        parser.add_argument(
            "--limit",
            type=int,
            help="Limit profile imports (for testing)",
        )

    def handle(self, *args, csv: Path, dry_run: bool, limit: int | None, **options):
        with disable_auto_indexing_if_enabled():
            stats = csv_optimize_and_import(csv, limit=limit, is_reindex_algolia=False)

        self.stdout.write(f"Created:   {stats.created}")
        self.stdout.write(f"Updated:   {stats.updated}")
        self.stdout.write(f"Unchanged: {stats.unchanged}")
        self.stdout.write(f"Deleted:   {stats.deleted}")
        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(f"Need LLM processing: {stats.needs_processing_count}")
        )
