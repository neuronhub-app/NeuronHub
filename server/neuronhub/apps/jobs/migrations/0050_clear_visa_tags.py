"""
#AI

Drops `tags_country_visa_sponsor` M2M - sync skips VisaSponsorship now.
"""

from django.db import migrations


def clear_visa_tags(apps, schema_editor):
    Job = apps.get_model("jobs", "Job")
    Job.tags_country_visa_sponsor.through.objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [("jobs", "0049_remove_historicaljob_is_removal_and_more")]

    operations = [migrations.RunPython(clear_visa_tags, migrations.RunPython.noop)]
