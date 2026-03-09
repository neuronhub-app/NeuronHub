from pathlib import Path

from asgiref.sync import async_to_sync
from django.core.management.base import BaseCommand

from neuronhub.apps.jobs.services.csv_import import csv_import_jobs
from neuronhub.apps.jobs.services.csv_import_orgs import csv_import_orgs
from neuronhub.apps.tests.services.db_stubs_repopulate import _disable_auto_indexing


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            "--csv",
            type=Path,
        )
        parser.add_argument(
            "--orgs-csv",
            type=Path,
        )
        parser.add_argument(
            "--limit",
            type=int,
        )

    def handle(
        self,
        *args,
        csv: Path | None,
        orgs_csv: Path | None,
        limit: int | None,
        **options,
    ):

        with _disable_auto_indexing():
            if csv:
                stats = async_to_sync(csv_import_jobs)(csv, limit=limit)
                self.stdout.write(f"Jobs created:   {stats.created}")
                self.stdout.write(f"Jobs updated:   {stats.updated}")

            if orgs_csv:
                org_stats = async_to_sync(csv_import_orgs)(orgs_csv, limit=limit)
                self.stdout.write(f"Orgs created:   {org_stats.created}")
                self.stdout.write(f"Orgs updated:   {org_stats.updated}")
