from pathlib import Path

from asgiref.sync import async_to_sync
from django.core.management.base import BaseCommand

from neuronhub.apps.jobs.services.csv_import_job_alerts import csv_import_job_alerts


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--csv", type=Path, required=True)

    def handle(self, *args, csv: Path, **options):
        stats = async_to_sync(csv_import_job_alerts)(csv)
        self.stdout.write(f"Job alerts created: {stats.created}")
        self.stdout.write(f"Invalid locations: {stats.invalid_location}")
