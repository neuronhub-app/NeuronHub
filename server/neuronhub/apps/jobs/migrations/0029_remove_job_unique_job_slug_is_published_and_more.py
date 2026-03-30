import django_extensions.db.fields
from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("jobs", "0028_jobalert_locations"),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name="job",
            name="unique_job_slug_is_published",
        ),
        migrations.AlterField(
            model_name="job",
            name="slug",
            field=django_extensions.db.fields.AutoSlugField(
                blank=True,
                editable=False,
                max_length=512,
                populate_from=["title", "org__name"],
                unique=True,
            ),
        ),
    ]
