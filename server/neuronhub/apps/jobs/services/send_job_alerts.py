import logging
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime

import sentry_sdk
from asgiref.sync import async_to_sync
from asgiref.sync import sync_to_async
from django.conf import settings
from django.core.mail import send_mail
from django.db.models import F
from django.db.models import Q
from django.template import Context
from django.template import Template
from django.template.loader import render_to_string
from sentry_sdk import capture_exception

from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.models import JobAlert
from neuronhub.apps.jobs.models import JobAlertLog
from neuronhub.apps.sites.models import SiteConfig
from neuronhub.apps.users.models import User


logger = logging.getLogger(__name__)


async def send_job_alerts(
    jobs: list[Job] | None = None,
    hour_local_to_send_at: int = 8,
    alert_ids: list[int] | None = None,
) -> JobAlertStats:
    stats = JobAlertStats()
    jobs_total_count = await Job.objects.filter(is_published=True).acount()

    alerts_qs = JobAlert.objects.filter(is_active=True)
    if alert_ids is not None:
        alerts_qs = alerts_qs.filter(id__in=alert_ids)

    async for alert in alerts_qs:
        if is_wrong_hour_if_alert_has_tz := (
            alert.tz and hour_local_to_send_at != datetime.now(tz=alert.tz).hour
        ):
            stats.skipped_due_to_tz += 1
            continue

        try:
            is_sent = await _send_job_alert(
                alert=alert,
                jobs=jobs,
                jobs_total_count=jobs_total_count,
            )
            if is_sent:
                stats.sent += 1
            else:
                stats.skipped += 1
        except Exception:
            sentry_sdk.set_context(
                "job_alert",
                {"id_ext": alert.id_ext, "email_hash": JobAlertLog.hash_email(alert.email)},
            )
            capture_exception()
            stats.failed += 1

    return stats


@dataclass
class JobAlertStats:
    sent: int = 0
    failed: int = 0
    skipped: int = 0
    skipped_due_to_tz: int = 0


async def _send_job_alert(
    alert: JobAlert,
    jobs: list[Job] | None,
    jobs_total_count: int,
) -> bool:
    jobs = jobs or await _get_jobs_qs_by_alert(alert)

    if not jobs:
        return False

    jobs = await _exclude_already_emailed_jobs_using_email_logs(alert, jobs)
    if not jobs:
        return False

    site = await SiteConfig.get_solo()
    filters = await _get_alert_filters_dict(alert)

    html = await sync_to_async(_render_email_html)(
        template_name="jobs/job_alert.html",
        context={
            **await _get_email_context(alert, site=site, filters=filters),
            "jobs": jobs,
            "jobs_matched_count": len(jobs),
            "jobs_total_count": jobs_total_count,
            # todo !! fix
            "client_jobs_matched_url": f"{settings.CLIENT_URL}{settings.CLIENT_URL_JOBS_PREFIX}",
        },
        template_override=site.email_template_job_alert,
    )
    await sync_to_async(send_mail)(
        subject=f"New job matches ({len(jobs)})",
        message="",
        html_message=html,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[alert.email],
    )
    await JobAlertLog.objects.abulk_create(
        [
            JobAlertLog(
                job_alert=alert,
                job=job,
                email_hash=JobAlertLog.hash_email(alert.email),
                jobs_notified_count=len(jobs),
            )
            for job in jobs
        ]
    )

    await JobAlert.objects.filter(id=alert.id).aupdate(
        sent_count=F("sent_count") + 1,
        jobs_notified_count=F("jobs_notified_count") + len(jobs),
    )
    return True


async def send_job_alert_confirmation_email(alert: JobAlert) -> None:
    site = await SiteConfig.get_solo()
    context = await _get_email_context(alert=alert, site=site)
    html = await sync_to_async(_render_email_html)(
        template_name="jobs/job_alert_confirmation.html",
        context=context,
        template_override=site.email_template_job_alert_confirmation,
    )
    await sync_to_async(send_mail)(
        subject="Your job alert is active",
        message="",
        html_message=html,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[alert.email],
    )


async def _get_email_context(
    alert: JobAlert,
    site: SiteConfig,
    filters: dict | None = None,
) -> dict:
    if filters is None:
        filters = await _get_alert_filters_dict(alert)

    subs_url = f"{settings.CLIENT_URL}{settings.CLIENT_URL_JOBS_PREFIX}/subscriptions"

    return {
        "site_name": site.name,
        "site_domain": site.domain,
        "client_url": settings.CLIENT_URL,
        "unsubscribe_url": f"{subs_url}/remove/{alert.id_ext}",
        "job_alerts_management_url": f"{subs_url}/{alert.id_ext}",
        "filters": filters,
        "has_filters": any(filters.values()),
        "logo_url": site.logo_url,
        "feedback_form_url": site.feedback_form_url,
        "submit_job_url": site.submit_job_url,
        "address": site.address,
        "client_jobs_url": f"{settings.CLIENT_URL}{settings.CLIENT_URL_JOBS_PREFIX}",
        "email_html_about_us": site.email_html_about_us,
        "email_html_feedback_request": site.email_html_feedback_request,
    }


@async_to_sync
async def _get_email_context_test(site: SiteConfig, user: User) -> dict:
    from neuronhub.apps.tests.test_gen import Gen

    gen = await Gen.create(is_user_default_superuser=False, user_default=user)
    jobs = [await gen.jobs.job(), await gen.jobs.job(), await gen.jobs.job()]
    return {
        **await _get_email_context(
            alert=await gen.jobs.job_alert(),
            site=site,
            filters={"Cause Areas": "Global Health", "Skill Sets": "Operations"},
        ),
        "jobs": jobs,
        "jobs_matched_count": len(jobs),
        "jobs_total_count": 42,
    }


def _render_email_html(template_name: str, context: dict, template_override: str = "") -> str:
    if template_override:
        return Template(template_override).render(Context(context))
    return render_to_string(template_name, context=context)


async def _exclude_already_emailed_jobs_using_email_logs(
    alert: JobAlert,
    jobs: list[Job],
) -> list[Job]:
    sent_ids: set[int] = set()
    async for job_id in JobAlertLog.objects.filter(
        job_alert=alert,
        job__in=jobs,
    ).values_list("job_id", flat=True):
        sent_ids.add(job_id)

    return [job for job in jobs if job.id not in sent_ids]


async def _get_jobs_qs_by_alert(alert: JobAlert) -> list[Job]:
    qs = Job.objects.select_related("org").filter(
        is_published=True,
        created_at__gte=alert.created_at,
    )

    if tag_ids := [tag_id async for tag_id in alert.tags.values_list("id", flat=True)]:
        q_obj = Q()
        for field in [
            "tags_skill",
            "tags_area",
            "tags_education",
            "tags_experience",
            "tags_workload",
            "tags_country_visa_sponsor",
        ]:
            q_obj |= Q(**{f"{field}__id__in": tag_ids})
        qs = qs.filter(q_obj).distinct()

    if alert.is_orgs_highlighted:
        qs = qs.filter(org__is_highlighted=True)

    if location_ids := [loc_id async for loc_id in alert.locations.values_list("id", flat=True)]:
        qs = qs.filter(locations__id__in=location_ids).distinct()

    if alert.salary_min:
        qs = qs.filter(salary_min__gte=alert.salary_min)

    return [job async for job in qs.order_by("-posted_at")]


async def _get_alert_filters_dict(alert: JobAlert) -> dict[str, str]:
    filters_by_category: dict[str, list[str]] = defaultdict(list)
    async for tag in alert.tags.prefetch_related("categories").all():
        category = await tag.categories.afirst()
        category_key = category.name if category else "other"
        filters_by_category[category_key].append(tag.name)

    filters: dict[str, str] = {}
    for category_key, label in {
        "area": "Cause Areas",
        "skill": "Skill Sets",
        "workload": "Role Types",
        "country": "Countries",
        "city": "Cities",
        "experience": "Experience",
        "education": "Education",
        "visa_sponsorship": "Visa Sponsorship",
    }.items():
        if filter_names := filters_by_category.get(category_key):
            filters[label] = ", ".join(filter_names)

    location_names = [loc.name async for loc in alert.locations.all()]
    if location_names:
        filters["Locations"] = ", ".join(location_names)
    if alert.is_remote:
        filters["Remote Roles"] = "Yes"
    if alert.salary_min:
        filters["Salary"] = f"${alert.salary_min:,}"
    if alert.is_orgs_highlighted:
        filters["Other Filters"] = "Highlighted Orgs"

    return filters
