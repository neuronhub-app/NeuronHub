import logging
from dataclasses import asdict

import sentry_sdk
from django_tasks import task
from sentry_sdk import monitor
from neuronhub.apps.jobs.services.send_alert_email import send_job_alert_emails


logger = logging.getLogger(__name__)


@task()
async def send_job_alert_emails_task():
    with monitor(
        monitor_slug=send_job_alert_emails_task.name,
        monitor_config={
            "schedule": {"type": "interval", "value": 1, "unit": "hour"},
            "max_runtime": 20,  # min
            "failure_issue_threshold": 3,
            "recovery_threshold": 2,
            "checkin_margin": 5,
        },
    ):
        logger.info(f"{send_job_alert_emails_task.name} started")

        stats = await send_job_alert_emails()

        logger.info(f"{send_job_alert_emails_task.name} report: {asdict(stats)}")

        for key, value in asdict(stats).items():
            sentry_sdk.metrics.gauge(f"job_alerts.{key}", value)
