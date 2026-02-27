from django.db import migrations


def populate_org_detail(apps, schema_editor):
    Job = apps.get_model("jobs", "Job")
    Org = apps.get_model("orgs", "Org")

    org_names = Job.objects.exclude(org="").values_list("org", flat=True).distinct()
    for name in org_names:
        org, _ = Org.objects.get_or_create(name=name)
        Job.objects.filter(org=name).update(org_detail=org)


class Migration(migrations.Migration):
    dependencies = [
        ("jobs", "0002_historicaljob_org_detail_job_org_detail"),
        ("orgs", "0003_org_is_highlighted_org_jobs_page_url_org_tags_area_and_more"),
    ]

    operations = [
        migrations.RunPython(populate_org_detail, migrations.RunPython.noop),
    ]
