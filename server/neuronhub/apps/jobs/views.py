from django.conf import settings
from django.http import HttpRequest
from django.http import HttpResponse
from django.http import HttpResponseForbidden

from neuronhub.apps.jobs.tasks import send_job_alert_emails_task


async def send_emails_cron(request: HttpRequest, secret: str) -> HttpResponse:
    if secret != settings.DJANGO_CRON_WEBHOOK_SECRET:
        return HttpResponseForbidden()
    await send_job_alert_emails_task.aenqueue()
    return HttpResponse("ok")
