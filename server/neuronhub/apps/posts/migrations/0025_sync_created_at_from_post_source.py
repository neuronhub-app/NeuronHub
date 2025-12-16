from django.db import migrations
from django.db.models import OuterRef, Subquery


def sync_created_at_from_post_source(apps, schema_editor):
    Post = apps.get_model("posts", "Post")
    PostSource = apps.get_model("importer", "PostSource")

    Post.objects.filter(post_source__isnull=False).update(
        created_at=Subquery(
            PostSource.objects.filter(post_id=OuterRef("pk")).values("created_at_external")[:1]
        )
    )


class Migration(migrations.Migration):
    dependencies = [
        ("posts", "0024_alter_historicaltoolcompany_created_at_and_more"),
        ("importer", "0009_alter_apihourlylimit_created_at_and_more"),
    ]

    operations = [
        migrations.RunPython(sync_created_at_from_post_source, migrations.RunPython.noop),
    ]
