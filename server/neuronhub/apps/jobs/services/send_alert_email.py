import logging
from dataclasses import dataclass

from asgiref.sync import sync_to_async
from django.conf import settings
from django.core.mail import send_mail
from django.db.models import F
from django.db.models import Q
from django.template.loader import render_to_string
from sentry_sdk import capture_exception

from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.models import JobAlert
from neuronhub.apps.jobs.models import JobAlertLog


logger = logging.getLogger(__name__)


async def send_job_alert_emails(jobs: list[Job] | None = None) -> JobAlertsStats:
    stats = JobAlertsStats()

    async for alert in JobAlert.objects.filter(is_active=True):
        try:
            is_sent = await _send_job_alert(alert=alert, jobs=jobs)
            if is_sent:
                stats.sent += 1
            else:
                stats.skipped += 1
        except Exception:
            capture_exception()
            stats.failed += 1

    return stats


async def _send_job_alert(alert: JobAlert, jobs: list[Job] | None = None) -> bool:
    jobs = jobs or await _get_jobs_matching_qs(alert)

    if not jobs:
        return False

    jobs = await _exclude_jobs_already_sent_using_alert_logs(alert, jobs)
    if not jobs:
        return False

    html = await sync_to_async(render_to_string)(
        "jobs/alert_email.html",
        context={
            "jobs": jobs,
            "alert": alert,
            "client_url": settings.CLIENT_URL,
        },
    )
    await sync_to_async(send_mail)(
        subject=f"New job matches ({len(jobs)})",
        message="",
        html_message=html,
        from_email=settings.ADMIN_EMAIL,
        recipient_list=[alert.email],
    )
    await JobAlertLog.objects.abulk_create(
        [
            JobAlertLog(
                job_alert=alert,
                job=job,
                email_hash=JobAlertLog.hash_email(alert.email),
            )
            for job in jobs
        ]
    )

    await JobAlert.objects.filter(id=alert.id).aupdate(sent_count=F("sent_count") + 1)
    return True


async def _exclude_jobs_already_sent_using_alert_logs(
    alert: JobAlert,
    jobs: list[Job],
) -> list[Job]:
    sent_ids: set[int] = set()
    async for job_id in JobAlertLog.objects.filter(job_alert=alert, job__in=jobs).values_list(
        "job_id", flat=True
    ):
        sent_ids.add(job_id)

    return [job for job in jobs if job.id not in sent_ids]


async def _get_jobs_matching_qs(alert: JobAlert) -> list[Job]:
    qs = Job.objects.select_related("org").all()

    if tag_ids := [tag.id async for tag in alert.tags.all()]:
        q = Q()
        for field in [
            "tags_skill",
            "tags_area",
            "tags_education",
            "tags_experience",
            "tags_workload",
        ]:
            q |= Q(**{f"{field}__id__in": tag_ids})
        qs = qs.filter(q).distinct()

    if alert.is_orgs_highlighted:
        qs = qs.filter(org__is_highlighted=True)

    if alert.is_remote:
        qs = qs.filter(is_remote=True)

    if alert.salary_min:
        qs = qs.filter(salary_min__gte=alert.salary_min)

    return [job async for job in qs.order_by("-posted_at")]


@dataclass
class JobAlertsStats:
    sent: int = 0
    failed: int = 0
    skipped: int = 0
