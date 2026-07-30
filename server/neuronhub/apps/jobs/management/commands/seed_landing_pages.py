from django.core.management.base import BaseCommand

from neuronhub.apps.jobs.services.landing_pages_seed import SeedReport
from neuronhub.apps.jobs.services.landing_pages_seed import seed_landing_pages


class Command(BaseCommand):
    help = (
        "Seeds the JobsLandingPage rows listed in landing_pages_sheet.py, unpublished."
        " Never clobbers a manager's admin edits. Use --dry-run first."
    )

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true")

    def handle(self, *args, dry_run: bool, **options):
        report = seed_landing_pages(is_dry_run=dry_run)
        self._write_report(report)

    def _write_report(self, report: SeedReport):
        if report.is_dry_run:
            self.stdout.write("DRY-RUN - nothing written.\n")

        for page in report.pages:
            if page.action.is_skipped:
                unmatched_suffix = (
                    f"  UNMATCHED={page.unmatched_names}" if page.unmatched_names else ""
                )
                self.stdout.write(f"{page.slug}  {page.action}{unmatched_suffix}")
                continue

            thin_suffix = "  <- THIN (0 jobs)" if page.job_count == 0 else ""
            self.stdout.write(
                f"{page.slug}  jobs={page.job_count}  [{page.action}]  label={page.label!r}  "
                f"tags={page.tag_names} locs={page.location_names}{thin_suffix}"
            )

        self._write_summary(report)

    def _write_summary(self, report: SeedReport):
        self.stdout.write("\n--- summary ---")
        self.stdout.write(f"pages: {len(report.pages)}  {dict(report.counts_by_action)}")
        self.stdout.write(f"thin (jobs=0): {report.thin_count}")
        self.stdout.write(
            f"unmatched names ({len(report.unmatched_all)}): {report.unmatched_all}"
        )
