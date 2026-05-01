import django.contrib.postgres.fields
from django.db import migrations
from django.db import models


def backfill_slug_and_date_ids(apps, schema_editor):
    """
    #AI

    Prefer `published_at` to match runtime `slug_and_date_id`.
    Fall back to `created_at` for historical rows where `published_at`
    is null - 0057 set it only for `is_published=True`, so legacy
    non-published Jobs still in `JobAlertLog.jobs` (from the old sync
    that flipped `is_published` instead of deleting) have no other date.
    """
    Job = apps.get_model("jobs", "Job")
    JobAlert = apps.get_model("jobs", "JobAlert")
    JobAlertLog = apps.get_model("jobs", "JobAlertLog")
    HistoricalJobAlert = apps.get_model("jobs", "HistoricalJobAlert")

    for log in JobAlertLog.objects.prefetch_related("jobs").all():
        if ids := [
            f"{j.slug}--{(j.published_at or j.created_at):%Y-%m-%d}" for j in log.jobs.all()
        ]:
            log.job_slug_and_date_ids = ids
            log.save(update_fields=["job_slug_and_date_ids"])

    # On slug collision (versioning) prefer the published row.
    dict_slug_to_date_str = {
        slug: f"{(published_at or created_at):%Y-%m-%d}"
        for slug, published_at, created_at in (
            Job.objects.order_by("slug", "-is_published", "-created_at")
            .distinct("slug")
            .values_list("slug", "published_at", "created_at")
        )
    }

    # Deleted-Job slugs kept as bare slug (no date) - no Job row to look up
    # the date. Safe: `track_click` compares against `{slug}--{date}`, never
    # matches a bare slug, so dedup is unaffected.
    for alert in [
        *JobAlert.objects.exclude(jobs_clicked=[]),
        *HistoricalJobAlert.objects.exclude(jobs_clicked=[]),
    ]:
        alert.jobs_clicked = [
            f"{slug}--{dict_slug_to_date_str[slug]}" if slug in dict_slug_to_date_str else slug
            for slug in alert.jobs_clicked
        ]
        alert.save(update_fields=["jobs_clicked"])


class Migration(migrations.Migration):
    dependencies = [
        ("jobs", "0057_historicaljob_published_at_job_published_at"),
    ]

    operations = [
        migrations.AddField(
            model_name="jobalertlog",
            name="job_slug_and_date_ids",
            field=django.contrib.postgres.fields.ArrayField(
                base_field=models.CharField(max_length=1024),
                blank=True,
                default=list,
                size=None,
                help_text="Stores `{job.slug}--{job.published_at}` to prevent duplicates in JobAlerts.",
            ),
        ),
        migrations.RunPython(backfill_slug_and_date_ids, migrations.RunPython.noop),
    ]
