"""
#AI
"""

import django.contrib.postgres.fields
from django.db import migrations, models


def split_semicolons_forward(apps, schema_editor):
    Profile = apps.get_model("profiles", "Profile")
    for p in Profile.objects.all():
        p.seeking_work_new = _split(p.seeking_work)
        p.recruitment_new = _split(p.recruitment)
        p.save(update_fields=["seeking_work_new", "recruitment_new"])

    HistoricalProfile = apps.get_model("profiles", "HistoricalProfile")
    for p in HistoricalProfile.objects.all():
        p.seeking_work_new = _split(p.seeking_work)
        p.recruitment_new = _split(p.recruitment)
        p.save(update_fields=["seeking_work_new", "recruitment_new"])


def _split(value: str) -> list[str]:
    if not value:
        return []
    return [part.strip() for part in value.split(";") if part.strip()]


_arr = django.contrib.postgres.fields.ArrayField(
    base_field=models.CharField(max_length=200), blank=True, default=list, size=None
)


class Migration(migrations.Migration):
    dependencies = [
        ("profiles", "0010_profile_visible_to_groups"),
    ]

    operations = [
        # 1. Add temp array columns
        migrations.AddField("profile", "seeking_work_new", field=_arr),
        migrations.AddField("profile", "recruitment_new", field=_arr),
        migrations.AddField("historicalprofile", "seeking_work_new", field=_arr),
        migrations.AddField("historicalprofile", "recruitment_new", field=_arr),
        # 2. Copy + split data
        migrations.RunPython(split_semicolons_forward, migrations.RunPython.noop),
        # 3. Drop old text columns
        migrations.RemoveField("profile", "seeking_work"),
        migrations.RemoveField("profile", "recruitment"),
        migrations.RemoveField("historicalprofile", "seeking_work"),
        migrations.RemoveField("historicalprofile", "recruitment"),
        # 4. Rename to original names
        migrations.RenameField("profile", "seeking_work_new", "seeking_work"),
        migrations.RenameField("profile", "recruitment_new", "recruitment"),
        migrations.RenameField("historicalprofile", "seeking_work_new", "seeking_work"),
        migrations.RenameField("historicalprofile", "recruitment_new", "recruitment"),
    ]
