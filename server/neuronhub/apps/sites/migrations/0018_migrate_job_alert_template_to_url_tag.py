from django.db import migrations


def migrate_job_alert_template_to_url_tag(apps, schema_editor):
    SiteConfig = apps.get_model("sites", "SiteConfig")
    site = SiteConfig.objects.first()
    if not site:
        return

    site.email_template_job_alert = (
        "{% load job_detail_url %}"
        + site.email_template_job_alert.replace(
            '<a href="{{ client_jobs_url }}/{{ job.slug }}?alert={{ alert_id }}"',
            '<a href="{% job_detail_url slug=job.slug alert_id=alert_id %}"',
        )
    )
    site.save()


class Migration(migrations.Migration):
    dependencies = [
        ("sites", "0017_historicalsiteconfig_is_job_alerts_staff_only_and_more"),
    ]

    operations = [
        migrations.RunPython(migrate_job_alert_template_to_url_tag, migrations.RunPython.noop),
    ]
