from asgiref.sync import async_to_sync
from django.core.management.base import BaseCommand

from neuronhub.apps.jobs.services.airtable_sync_jobs import airtable_sync_jobs
from neuronhub.apps.jobs.services.airtable_sync_orgs import airtable_sync_orgs


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int)
        parser.add_argument("--skip-orgs", action="store_true")
        parser.add_argument("--skip-jobs", action="store_true")
        parser.add_argument("--no-logos", action="store_true")

    def handle(
        self,
        *args,
        limit: int | None,
        skip_orgs: bool,
        skip_jobs: bool,
        no_logos: bool,
        **options,
    ):
        if not skip_orgs:
            # Orgs always sync in full: Jobs sync Org.aget_or_create() with
            # default is_highlighted=False, so any unsynced Org silently
            # corrupts Job visibility on Algolia until next full Orgs sync.
            org_stats = async_to_sync(airtable_sync_orgs)(is_download_logos=not no_logos)
            self.stdout.write(f"Orgs created:     {org_stats.created}")
            self.stdout.write(f"Orgs updated:     {org_stats.updated}")

        if not skip_jobs:
            stats = async_to_sync(airtable_sync_jobs)(limit=limit)
            self.stdout.write(f"Jobs created:     {stats.created}")
            self.stdout.write(f"Jobs updated:     {stats.updated}")
            self.stdout.write(f"Jobs unpublished: {stats.unpublished}")
