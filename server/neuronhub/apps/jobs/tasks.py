import logging
import typing
from dataclasses import asdict

import sentry_sdk
from django.conf import settings
from django_tasks import task
from sentry_sdk import monitor

from neuronhub.apps.jobs.services.airtable_sync_jobs import airtable_sync_jobs
from neuronhub.apps.jobs.services.airtable_sync_orgs import airtable_sync_orgs
from neuronhub.apps.jobs.services.send_job_alerts import send_job_alerts
from neuronhub.apps.sites.services.send_email import send_email


if typing.TYPE_CHECKING:
    from sentry_sdk._types import MonitorConfig


logger = logging.getLogger(__name__)


@task()
async def send_job_alert_emails_task():
    with monitor(
        monitor_config=monitor_config,
        monitor_slug=send_job_alert_emails_task.name,
    ):
        logger.info(f"{send_job_alert_emails_task.name} started")

        stats = await send_job_alerts()

        logger.info(f"{send_job_alert_emails_task.name} report: {asdict(stats)}")

        for key, value in asdict(stats).items():
            sentry_sdk.metrics.gauge(f"job_alerts.{key}", value)


monitor_config: MonitorConfig = {
    "schedule": {"type": "interval", "value": 1, "unit": "hour"},
    "max_runtime": 30,  # min
    "failure_issue_threshold": 2,
    "recovery_threshold": 2,
    "checkin_margin": 10,  # min
}


@task()
async def send_job_alert_emails_by_ids_task(alert_ids: list[int]):
    logger.info(f"send_job_alert_emails_by_ids_task started for {len(alert_ids)} alerts")
    stats = await send_job_alerts(alert_ids=alert_ids)
    logger.info(f"send_job_alert_emails_by_ids_task report: {asdict(stats)}")


@task()
async def airtable_sync_task(email_to_notify: str = None):
    with sentry_sdk.start_transaction(op="function", name=airtable_sync_task.name):
        with sentry_sdk.start_span(op="queue.process", name=airtable_sync_task.name) as span:
            sentry_sdk.set_tag("scope", "jobs/sync")

            span.set_data("messaging.destination.name", airtable_sync_task.queue_name)
            span.set_data("messaging.message.id", airtable_sync_task.name)

            logger.info(f"{airtable_sync_task.name} started")
            orgs_stats = await airtable_sync_orgs()
            jobs_stats = await airtable_sync_jobs()
            logger.info(
                f"{airtable_sync_task.name} done: orgs={asdict(orgs_stats)} jobs={asdict(jobs_stats)}"
            )
            if email_to_notify:
                await send_email(
                    subject="Airtable sync completed",
                    email_to=email_to_notify,
                    message_html=f"""
                    <p>Stats: jobs={asdict(jobs_stats)}, orgs={asdict(orgs_stats)}</p>
                    
                    <p>Those changes will not be published without approval.</p> 
                    
                    <p><a href="{settings.CLIENT_URL}/jobs/versions">Approve & publish</a></p>
                    """,
                )
