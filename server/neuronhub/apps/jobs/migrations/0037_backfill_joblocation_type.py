from django.db import migrations


def backfill_type(apps, schema_editor):
    JobLocation = apps.get_model("jobs", "JobLocation")
    for loc in JobLocation.objects.all():
        if loc.is_remote:
            loc.type = "remote"
        elif loc.city:
            loc.type = "city"
        else:
            loc.type = "country"
        loc.save(update_fields=["type"])


class Migration(migrations.Migration):
    dependencies = [
        ("jobs", "0036_joblocation_type"),
    ]

    operations = [
        migrations.RunPython(backfill_type, migrations.RunPython.noop),
    ]
