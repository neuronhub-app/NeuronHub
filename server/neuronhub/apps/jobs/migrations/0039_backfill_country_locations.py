from django.db import migrations

from neuronhub.apps.jobs.models import JobLocation


LocationType = JobLocation.LocationType


def backfill_country_locations(apps, schema_editor):
    JobLocation = apps.get_model("jobs", "JobLocation")
    Job = apps.get_model("jobs", "Job")

    city_locs = JobLocation.objects.filter(type=LocationType.CITY).exclude(country="")
    country_names: list[str] = city_locs.values_list("country", flat=True).distinct()

    for country_name in country_names:
        country_loc, _ = JobLocation.objects.get_or_create(
            name=country_name,
            defaults={"type": LocationType.COUNTRY, "country": country_name},
        )
        city_loc_ids = city_locs.filter(country=country_name).values_list("id", flat=True)
        jobs = Job.objects.filter(locations__in=city_loc_ids).distinct()
        for job in jobs:
            job.locations.add(country_loc)


class Migration(migrations.Migration):
    dependencies = [
        ("jobs", "0038_alter_joblocation_type"),
    ]

    operations = [
        migrations.RunPython(backfill_country_locations, migrations.RunPython.noop),
    ]
