"""
#AI
Restores unique slug on published Jobs - partial constraint.

Dropped in 0029 for Airtable sync as an #AI shortcut. Restored as partial:
drafts (`is_published=False`) may freely share a slug, incl. with their
published peer, so `publish_job_versions` only flips `is_published` (no slug copy).
"""

from django.db import migrations
from django.db import models
from django.db.models import Count


def deduplicate_published_slugs(apps, schema_editor):
    Job = apps.get_model("jobs", "Job")
    dupes = (
        Job.objects.filter(is_published=True)
        .values("slug")
        .annotate(cnt=Count("id"))
        .filter(cnt__gt=1)
    )
    for entry in dupes:
        jobs = Job.objects.filter(slug=entry["slug"], is_published=True).order_by("pk")
        for i, job in enumerate(jobs[1:], start=2):
            job.slug = f"{job.slug}-{i}"
            job.save(update_fields=["slug"])


class Migration(migrations.Migration):
    dependencies = [("jobs", "0050_clear_visa_tags")]

    operations = [
        migrations.RunPython(deduplicate_published_slugs, migrations.RunPython.noop),
        migrations.AddConstraint(
            model_name="job",
            constraint=models.UniqueConstraint(
                fields=("slug",),
                condition=models.Q(is_published=True),
                name="unique_job_slug_when_is_published",
            ),
        ),
    ]
