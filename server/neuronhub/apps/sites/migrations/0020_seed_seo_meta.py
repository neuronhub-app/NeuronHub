from django.db import migrations


def seed_seo_meta(apps, schema_editor):
    # Only the primary `/`. The `/jobs` alias mirrors it at runtime (useHeadMeta).
    SeoMeta = apps.get_model("sites", "SeoMeta")
    SeoMeta.objects.get_or_create(path="/", defaults=_meta_home)


_meta_home = {
    "meta_title": "High-Impact Job Board",
    "meta_description": (
        "Find a job that's good for you and good for the world. A continuously updated, "
        "curated list of high-impact job opportunities for people who want to make a difference."
    ),
    "meta_image_url": "https://media.neuronhub.app/meta/og-image.png",
}


class Migration(migrations.Migration):
    dependencies = [
        ("sites", "0019_seometa"),
    ]

    operations = [
        migrations.RunPython(seed_seo_meta, migrations.RunPython.noop),
    ]
