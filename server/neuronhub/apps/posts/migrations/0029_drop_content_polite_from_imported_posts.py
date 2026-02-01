from django.db import migrations

from neuronhub.apps.importer.models import ImportDomain
from neuronhub.apps.posts.models import PostTypeEnum


def drop_content_polite_from_imported(apps, schema_editor):
    Post = apps.get_model("posts", "Post")
    Post.objects.filter(
        post_source__domain=ImportDomain.HackerNews,
        type=PostTypeEnum.Post,
    ).update(
        content_polite="",
        content_direct="",
    )


class Migration(migrations.Migration):
    dependencies = [
        ("posts", "0028_add_field_post_content_polite_html_ssr"),
    ]

    operations = [
        migrations.RunPython(drop_content_polite_from_imported),
    ]
