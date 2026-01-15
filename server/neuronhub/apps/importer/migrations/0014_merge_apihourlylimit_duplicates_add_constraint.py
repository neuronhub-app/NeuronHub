from django.db import migrations
from django.db import models
from django.db.models import Sum


def api_hourly_limit_duplicates_merge(apps, schema_editor):
    """
    The original ApiHourlyLimit.query_at_first logic was broken - we merge the resulting from 0013 migrations instances that would violate the new `api_limit_unique_per_hour` constrain.
    """
    ApiHourlyLimit = apps.get_model("importer", "ApiHourlyLimit")

    limit_duplicates = set()
    limits_to_delete = []

    for limit in ApiHourlyLimit.objects.order_by("source", "query_date", "query_hour", "-id"):
        limit_unique_key = (limit.source, limit.query_date, limit.query_hour)
        if limit_unique_key in limit_duplicates:
            limits_to_delete.append(limit.id)
            continue
        limit_duplicates.add(limit_unique_key)

        limit_group = ApiHourlyLimit.objects.filter(
            source=limit.source,
            query_date=limit.query_date,
            query_hour=limit.query_hour,
        )
        if limit_group.count() > 1:
            limit.count_current = limit_group.aggregate(total=Sum("count_current"))["total"]
            limit.save()

    ApiHourlyLimit.objects.filter(id__in=limits_to_delete).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("importer", "0013_apihourlylimit_query_date_apihourlylimit_query_hour_and_more"),
    ]

    operations = [
        migrations.RunPython(
            api_hourly_limit_duplicates_merge,
            reverse_code=migrations.RunPython.noop,
        ),
        migrations.RemoveField(
            model_name="apihourlylimit",
            name="query_at_first",
        ),
        migrations.AddConstraint(
            model_name="apihourlylimit",
            constraint=models.UniqueConstraint(
                fields=("source", "query_date", "query_hour"),
                name="api_limit_unique_per_hour",
            ),
        ),
    ]
