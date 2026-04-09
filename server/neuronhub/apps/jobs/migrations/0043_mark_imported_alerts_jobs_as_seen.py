from datetime import datetime
from datetime import timezone

from django.db import migrations
from django.utils.crypto import salted_hmac


# Go-Live 2026.04.07 16:30 PT (PDT = UTC-7)
CUTOFF_UTC = datetime(2026, 4, 7, 23, 30, 0, tzinfo=timezone.utc)


def mark_imported_alerts_jobs_as_seen(apps, schema_editor):
    """
    #AI-slop

    prevents imported JobAlerts from sending duplicate alerts.
    """
    JobAlert = apps.get_model("jobs", "JobAlert")
    JobAlertLog = apps.get_model("jobs", "JobAlertLog")
    Job = apps.get_model("jobs", "Job")

    alerts_imported = list(JobAlert.objects.filter(is_active=False))
    jobs_existing = list(Job.objects.filter(is_published=True, created_at__lt=CUTOFF_UTC))

    alerts_existing = set(
        JobAlertLog.objects.filter(
            job_alert__in=alerts_imported,
            job__in=jobs_existing,
        ).values_list("job_alert_id", "job_id")
    )

    logs = [
        JobAlertLog(
            job_alert=alert_imported,
            job=job_existing,
            email_hash=salted_hmac(
                key_salt="JobAlertLog", value=alert_imported.email
            ).hexdigest(),
        )
        for alert_imported in alerts_imported
        for job_existing in jobs_existing
        if (alert_imported.id, job_existing.id) not in alerts_existing
    ]

    if logs:
        JobAlertLog.objects.bulk_create(logs, batch_size=1000)


class Migration(migrations.Migration):
    dependencies = [
        ("jobs", "0042_historicaljob_source_ext_job_source_ext"),
    ]

    operations = [
        migrations.RunPython(mark_imported_alerts_jobs_as_seen, migrations.RunPython.noop),
    ]
