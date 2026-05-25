import csv
from typing import Any

from django.conf import settings
from django.http import HttpRequest
from django.http import HttpResponse
from django.http import HttpResponseForbidden

from neuronhub.apps.graphql.persisted_query_extension import graphql_whitelist_BE
from neuronhub.apps.jobs.tasks import send_job_alert_emails_task
from neuronhub.graphql import schema


async def send_emails_cron(request: HttpRequest, secret: str) -> HttpResponse:
    if secret != settings.DJANGO_CRON_WEBHOOK_SECRET:
        return HttpResponseForbidden()
    await send_job_alert_emails_task.aenqueue()
    return HttpResponse("ok")


async def jobs_csv(request: HttpRequest) -> HttpResponse:
    """
    #AI #quality-10%

    See [[public-api.mdx]].

    `JobsPublic` GraphQL flattened into CSV.
    - nested objects → dot-notated columns.
    - array-of-object cells → joined `.name` strings with `; `.
    """
    result = await schema.execute(graphql_whitelist_BE.queries["JobsPublic"])
    assert not result.errors, result.errors
    assert result.data is not None
    rows = [_flatten_json(job) for job in result.data["jobs_public"]]

    fieldnames = sorted({key for row in rows for key in row})

    response = HttpResponse(content_type="text/csv; charset=utf-8")
    response["Content-Disposition"] = 'attachment; filename="jobs.csv"'

    writer = csv.DictWriter(response, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)
    return response


def _flatten_json(obj: dict[str, Any], prefix: str = "") -> dict[str, Any]:
    """
    #AI

    Nullable nested objects diverge: `org.logo` = None vs `{url}` → both
    `org.logo` and `org.logo.url` columns. Acceptable trash for MVP.
    """
    output: dict[str, Any] = {}
    for key, value in obj.items():
        path = f"{prefix}.{key}" if prefix else key
        if isinstance(value, dict):
            output.update(_flatten_json(value, path))
        elif isinstance(value, list):
            output[path] = "; ".join(item["name"] for item in value)
        else:
            output[path] = value
    return output
