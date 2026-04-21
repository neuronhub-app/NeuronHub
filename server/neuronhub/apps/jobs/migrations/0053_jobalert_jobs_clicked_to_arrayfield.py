from django.contrib.postgres.fields import ArrayField
from django.db import migrations
from django.db import models


def copy_m2m_to_array(apps, schema_editor):
    """
    #AI, not reviewed
    """
    JobAlert = apps.get_model("jobs", "JobAlert")
    HistoricalJobAlert = apps.get_model("jobs", "HistoricalJobAlert")
    HistJobsClicked = apps.get_model("jobs", "HistoricalJobAlert_jobs_clicked")

    for alert in JobAlert.objects.all():
        slugs = list(alert.jobs_clicked.values_list("slug", flat=True))
        if slugs:
            alert.jobs_clicked_new = slugs
            alert.save(update_fields=["jobs_clicked_new"])

    slugs_by_hist_id: dict[int, list[str]] = {}
    for row in HistJobsClicked.objects.select_related("job"):
        if row.job is None:
            continue
        slugs_by_hist_id.setdefault(row.history_id, []).append(row.job.slug)

    for history_id, slugs in slugs_by_hist_id.items():
        HistoricalJobAlert.objects.filter(history_id=history_id).update(
            jobs_clicked_new=slugs,
        )


class Migration(migrations.Migration):
    dependencies = [("jobs", "0052_historicaljob_is_created_by_sync_and_more")]

    operations = [
        migrations.AddField(
            model_name="jobalert",
            name="jobs_clicked_new",
            field=ArrayField(
                models.CharField(max_length=1024), default=list, blank=True, size=None
            ),
        ),
        migrations.AddField(
            model_name="historicaljobalert",
            name="jobs_clicked_new",
            field=ArrayField(
                models.CharField(max_length=1024), default=list, blank=True, size=None
            ),
        ),
        migrations.RunPython(copy_m2m_to_array, migrations.RunPython.noop),
        migrations.RemoveField(model_name="jobalert", name="jobs_clicked"),
        migrations.DeleteModel(name="HistoricalJobAlert_jobs_clicked"),
        migrations.RenameField(
            model_name="jobalert",
            old_name="jobs_clicked_new",
            new_name="jobs_clicked",
        ),
        migrations.RenameField(
            model_name="historicaljobalert",
            old_name="jobs_clicked_new",
            new_name="jobs_clicked",
        ),
    ]
