import timezone_field.fields
from django.db import migrations
from django.db import models


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Org",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=255)),
                ("slug", models.SlugField(max_length=255, unique=True)),
                ("domain", models.CharField(max_length=255)),
                (
                    "tz",
                    timezone_field.fields.TimeZoneField(default="America/Los_Angeles"),
                ),
            ],
            options={
                "ordering": ["name"],
            },
        ),
    ]
