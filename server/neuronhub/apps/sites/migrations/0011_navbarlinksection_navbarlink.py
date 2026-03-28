import django.db.models.deletion
from django.conf import settings
from django.db import migrations
from django.db import models


TOP_LEVEL_LABELS = {
    "Career Guide",
    "Career Profiles",
    "Job Board",
    "Explore",
    "Advising",
    "About",
}


def populate_children(apps, schema_editor):
    if settings.VITE_SITE != "pg":
        return

    NavbarLinkSection = apps.get_model("sites", "NavbarLinkSection")
    NavbarLink = apps.get_model("sites", "NavbarLink")

    # Clean up stale rows from unapplied 0012
    NavbarLinkSection.objects.exclude(label__in=TOP_LEVEL_LABELS).delete()

    for parent_label, children in NAV_CHILDREN.items():
        section = NavbarLinkSection.objects.filter(label=parent_label).first()
        if not section:
            continue
        for i, child in enumerate(children):
            NavbarLink.objects.create(section=section, order=i, **child)


NAV_CHILDREN = {
    "Explore": [
        {"label": "How to Get a Job", "href": "https://probablygood.org/how-to-get-a-job/"},
        {"label": "Cause Areas", "href": "https://probablygood.org/cause-areas/"},
        {"label": "Core Concepts", "href": "https://probablygood.org/core-concepts/"},
        {"label": "Degree Paths", "href": "https://probablygood.org/degree-paths/"},
        {"label": "Interviews", "href": "https://probablygood.org/interviews/"},
        {"label": "Newsletter", "href": "https://probablygood.org/newsletter/"},
    ],
    "Advising": [
        {"label": "1:1 Career Advice", "href": "https://probablygood.org/advising/"},
        {"label": "Career Workshops", "href": "https://probablygood.org/workshops/"},
    ],
    "About": [
        {"label": "Who we are", "href": "https://probablygood.org/about/"},
        {"label": "Our principles", "href": "https://probablygood.org/principles/"},
        {"label": "Contact us", "href": "https://probablygood.org/contact/"},
        {"label": "Donate", "href": "https://probablygood.org/donate/"},
    ],
}


class Migration(migrations.Migration):
    dependencies = [
        ("sites", "0010_merge_20260326_2108"),
    ]

    operations = [
        migrations.RenameModel(
            old_name="NavbarLink",
            new_name="NavbarLinkSection",
        ),
        migrations.RunSQL(
            'DROP INDEX IF EXISTS "sites_navbarlink_order_b59652a4"',
            migrations.RunSQL.noop,
        ),
        migrations.CreateModel(
            name="NavbarLink",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                ("label", models.CharField(max_length=255)),
                ("href", models.URLField(max_length=512)),
                ("order", models.PositiveIntegerField(db_index=True, default=0)),
                (
                    "section",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="links",
                        to="sites.navbarlinksection",
                    ),
                ),
            ],
            options={
                "ordering": ["order"],
            },
        ),
        migrations.RunPython(populate_children, migrations.RunPython.noop),
    ]
