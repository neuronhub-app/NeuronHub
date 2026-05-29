from django.db import migrations
from django.db import models


class Migration(migrations.Migration):
    dependencies = [
        ("jobs", "0061_historicaljobslandingpage_meta_title_and_more"),
    ]

    operations = [
        migrations.RenameField(
            model_name="job",
            old_name="posted_at",
            new_name="created_at_in_airtable",
        ),
        migrations.RenameField(
            model_name="historicaljob",
            old_name="posted_at",
            new_name="created_at_in_airtable",
        ),
        migrations.AlterField(
            model_name="job",
            name="created_at_in_airtable",
            field=models.DateTimeField(
                help_text="Airtable 'Date Added'. Internal-only: drafts have no published_at, so URL-dedup tie-breaks on this."
            ),
        ),
        migrations.AlterField(
            model_name="historicaljob",
            name="created_at_in_airtable",
            field=models.DateTimeField(
                help_text="Airtable 'Date Added'. Internal-only: drafts have no published_at, so URL-dedup tie-breaks on this."
            ),
        ),
        migrations.AlterField(
            model_name="job",
            name="is_duplicate_url_valid",
            field=models.BooleanField(
                default=False,
                help_text="Set from Airtable `Duplicate URL` - approved duplicate by data manager. Same-URL Jobs are collapsed to the latest `created_at_in_airtable`.",
            ),
        ),
        migrations.AlterField(
            model_name="historicaljob",
            name="is_duplicate_url_valid",
            field=models.BooleanField(
                default=False,
                help_text="Set from Airtable `Duplicate URL` - approved duplicate by data manager. Same-URL Jobs are collapsed to the latest `created_at_in_airtable`.",
            ),
        ),
    ]
