from django.db import migrations
from django.template.loader import get_template


def populate_email_templates(apps, schema_editor):
    SiteConfig = apps.get_model("sites", "SiteConfig")
    site = SiteConfig.objects.first()
    if not site:
        return

    site.email_template_job_alert = get_template("jobs/job_alert.html").template.source
    site.email_template_job_alert_confirmation = get_template(
        "jobs/job_alert_confirmation.html"
    ).template.source
    site.save()


class Migration(migrations.Migration):
    dependencies = [
        ("sites", "0006_footersection_footerlink_navlink"),
    ]

    operations = [
        migrations.RunPython(populate_email_templates, migrations.RunPython.noop),
    ]
