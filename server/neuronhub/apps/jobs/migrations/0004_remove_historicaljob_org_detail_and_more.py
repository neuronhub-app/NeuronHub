import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("jobs", "0003_populate_org_detail_from_org_name"),
        ("orgs", "0003_org_is_highlighted_org_jobs_page_url_org_tags_area_and_more"),
    ]

    operations = [
        # Remove the old CharField `org`
        migrations.RemoveField(
            model_name="historicaljob",
            name="org",
        ),
        migrations.RemoveField(
            model_name="job",
            name="org",
        ),
        # Rename `org_detail` → `org`
        migrations.RenameField(
            model_name="historicaljob",
            old_name="org_detail",
            new_name="org",
        ),
        migrations.RenameField(
            model_name="job",
            old_name="org_detail",
            new_name="org",
        ),
    ]
