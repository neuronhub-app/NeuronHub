from django.db import migrations
from django.db.models import Count


def merge_duplicate_orgs(apps, schema_editor):
    """
    #AI #quality-20%
    """
    Org = apps.get_model("orgs", "Org")
    Job = apps.get_model("jobs", "Job")
    User = apps.get_model("users", "User")

    org_names_duplicated = (
        Org.objects.values("name")
        .annotate(count=Count("id"))
        .filter(count__gt=1)
        .values_list("name", flat=True)
    )

    for org_name in org_names_duplicated:
        orgs = list(Org.objects.filter(name=org_name))

        # Org with most populated fields; tiebreak = oldest (lowest pk).
        # #quality-0%
        org_to_keep = max(orgs, key=lambda org: (_populated_field_count(org), -org.pk))

        for org_dup in orgs:
            if org_dup.pk == org_to_keep.pk:
                continue
            Job.objects.filter(org=org_dup).update(org=org_to_keep)  # PROTECT
            User.objects.filter(org=org_dup).update(org=org_to_keep)  # SET_NULL
            org_to_keep.tags_area.add(*org_dup.tags_area.all())
            org_dup.delete()


class Migration(migrations.Migration):
    dependencies = [
        ("orgs", "0006_org_website_with_utm"),
        ("jobs", "0062_rename_posted_at_to_created_at_in_airtable"),
        ("users", "0004_alter_user_email"),
    ]

    operations = [
        migrations.RunPython(merge_duplicate_orgs, migrations.RunPython.noop),
    ]


def _populated_field_count(org):
    fields_populated = [
        org.logo,
        org.description,
        org.website,
        org.domain,
        org.jobs_page_url,
        org.is_highlighted,
    ]
    scalar_count = sum(1 for value in fields_populated if value)
    return scalar_count + org.tags_area.count()
