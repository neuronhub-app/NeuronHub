import logging
from collections import defaultdict
from dataclasses import asdict
from dataclasses import dataclass
from datetime import datetime

import sentry_sdk
from asgiref.sync import sync_to_async
from django.conf import settings
from django.db.models import F
from django.db.models import Q
from django.template import Context
from django.template import Template
from django.template.loader import render_to_string
from sentry_sdk import capture_exception
from sentry_sdk.crons import MonitorStatus
from sentry_sdk.crons import capture_checkin

from neuronhub.apps.algolia.services.disable_auto_indexing_if_enabled import (
    disable_auto_indexing_if_enabled,
)
from neuronhub.apps.jobs.models import Job
from neuronhub.apps.jobs.models import JobAlert
from neuronhub.apps.jobs.models import JobAlertLog
from neuronhub.apps.posts.graphql.types_lazy import TagCategory
from neuronhub.apps.sites.models import SiteConfig
from neuronhub.apps.sites.services.send_email import send_email
from neuronhub.apps.users.models import User


logger = logging.getLogger(__name__)


async def send_job_alerts(
    hour_local_to_send_at: int = 8,
    alert_ids: list[int] | None = None,
    is_include_test_jobs: bool = settings.DJANGO_ENV.is_dev(),
) -> JobAlertBulkReport:
    from neuronhub.apps.jobs.tasks import send_job_alert_emails_task

    report = JobAlertBulkReport()

    alerts_qs = JobAlert.objects.filter(is_active=True)
    if alert_ids is not None:
        alerts_qs = alerts_qs.filter(id__in=alert_ids)

    jobs_total_count = await Job.objects.filter(
        is_published=True, is_test_job=is_include_test_jobs
    ).acount()

    async for alert in alerts_qs:
        if is_sentry_tracked_live_run := not is_include_test_jobs:
            capture_checkin(
                monitor_slug=send_job_alert_emails_task.name, status=MonitorStatus.IN_PROGRESS
            )

        if is_wrong_hour_if_alert_has_tz := (
            alert.tz and hour_local_to_send_at != datetime.now(tz=alert.tz).hour
        ):
            report.skipped_due_to_tz += 1
            continue

        try:
            report_send = await _send_job_alert(
                alert=alert,
                jobs_total_count=jobs_total_count,
                is_include_test_jobs=is_include_test_jobs,
            )
            if report_send.is_sent:
                report.sent += 1
            else:
                if report_send.matched_wo_duplicates == 0 and report_send.matched_total > 0:
                    report.skipped_due_to_duplicates += 1

                if report_send.matched_total == 0:
                    report.skipped_due_to_no_new_matches_or_new_alert += 1

            logger.info(
                f"{send_job_alert_emails_task.name} _send_job_alert: {asdict(report_send)}"
            )
        except Exception:
            sentry_sdk.set_context(
                "job_alert",
                {"id_ext": alert.id_ext, "email_hash": JobAlertLog.hash_email(alert.email)},
            )
            capture_exception()
            report.failed += 1

    return report


@dataclass
class JobAlertBulkReport:
    sent: int = 0
    failed: int = 0
    skipped_due_to_no_new_matches_or_new_alert: int = 0
    skipped_due_to_tz: int = 0
    skipped_due_to_duplicates: int = 0


@dataclass
class JobAlertReport:
    alert_id: int
    is_sent: bool = False
    matched_total: int = 0
    matched_wo_duplicates: int = 0


async def _send_job_alert(
    alert: JobAlert,
    jobs_total_count: int,
    is_include_test_jobs: bool = False,
) -> JobAlertReport:
    jobs_matched_all = await _get_jobs_qs_by_alert(
        alert, is_include_test_jobs=is_include_test_jobs
    )

    report = JobAlertReport(matched_total=len(jobs_matched_all), alert_id=alert.id)

    if not jobs_matched_all:
        return report

    jobs = await _exclude_already_emailed_jobs_using_email_logs(alert, jobs_matched_all)
    report.matched_wo_duplicates = len(jobs)
    if not jobs:
        return report

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
    await send_email(
        site=site,
        subject=f"New job matches ({len(jobs)})",
        message_html=html,
        email_to=alert.email,
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
    report.is_sent = True
    return report


async def send_job_alert_confirmation_email(alert: JobAlert) -> None:
    site = await SiteConfig.get_solo()
    context = await _get_email_context(alert=alert, site=site)
    html = await sync_to_async(_render_email_html)(
        template_name="jobs/job_alert_confirmation.html",
        context=context,
        template_override=site.email_template_job_alert_confirmation,
    )
    await send_email(
        site=site,
        subject="Your job alert is active",
        message_html=html,
        email_to=alert.email,
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


@dataclass
class JobAlertTestContext:
    jobs_created: list[Job]
    alert: JobAlert

    async def delete_alert_and_jobs(self):
        with disable_auto_indexing_if_enabled():
            for job in self.jobs_created:
                await job.adelete()
            await self.alert.logs.all().adelete()  # default is on_delete=SET_NULL
            await self.alert.adelete()

    @classmethod
    async def create(cls, user: User) -> JobAlertTestContext:
        from neuronhub.apps.tests.test_gen import Gen

        with disable_auto_indexing_if_enabled():
            gen = await Gen.create(is_user_default_superuser=False, user_default=user)
            tags = [
                await gen.posts.tag(Job.Tags.CareerCapital, TagCategory.Area),
                await gen.posts.tag(Job.Tags.ProfitForGood, TagCategory.Area),
            ]
            jobs = [
                await gen.jobs.job(tags=tags),
                await gen.jobs.job(tags=tags),
                await gen.jobs.job(tags=tags),
            ]

        alert = await gen.jobs.job_alert(email=user.email, tz=None, tags=tags)

        return JobAlertTestContext(jobs_created=jobs, alert=alert)


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


async def _get_jobs_qs_by_alert(
    alert: JobAlert, is_include_test_jobs: bool = settings.DJANGO_ENV.is_dev()
) -> list[Job]:
    """
    see [[adding-job-alert-filters.mdx]] checklist
    """
    qs = Job.objects.select_related("org").filter(
        is_published=True,
        is_test_job=is_include_test_jobs,
        created_at__gte=alert.created_at,
    )

    # todo !!! fix: Algolia uses AND filters, this is OR. Review & test.
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
        qs = qs.filter(Q(salary_min__gte=alert.salary_min) | Q(salary_min=None))

    if alert.is_exclude_no_salary:
        qs = qs.exclude(salary_min=None)

    if alert.is_exclude_career_capital:
        qs = qs.exclude(tags_area__name=Job.Tags.CareerCapital)

    if alert.is_exclude_profit_for_good:
        qs = qs.exclude(tags_area__name=Job.Tags.ProfitForGood)

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
    if alert.salary_min:
        filters["Salary"] = f"${alert.salary_min:,}"

    bool_filters: list[str] = []
    if alert.is_orgs_highlighted:
        bool_filters.append("Highlighted Orgs")
    if alert.is_exclude_no_salary:
        bool_filters.append("Has Salary")
    if alert.is_exclude_career_capital:
        bool_filters.append("Exclude Career Capital")
    if alert.is_exclude_profit_for_good:
        bool_filters.append("Exclude Profit for Good")
    if bool_filters:
        filters["Other Filters"] = ", ".join(bool_filters)

    return filters
