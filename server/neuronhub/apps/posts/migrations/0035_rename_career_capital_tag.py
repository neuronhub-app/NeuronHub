from django.db import migrations


def rename_career_capital_tag(apps, schema_editor):
    PostTag = apps.get_model("posts", "PostTag")
    PostTag.objects.filter(name="Career Capital").update(name="Career-Capital")


class Migration(migrations.Migration):
    dependencies = [
        ("posts", "0034_alter_posttag_is_always_indexed_by_algolia"),
    ]

    operations = [
        migrations.RunPython(rename_career_capital_tag, migrations.RunPython.noop),
    ]
