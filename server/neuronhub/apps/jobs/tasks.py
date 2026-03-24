import logging
import typing
from dataclasses import asdict

import sentry_sdk
from django_tasks import task
from sentry_sdk import monitor


if typing.TYPE_CHECKING:
    from sentry_sdk._types import MonitorConfig

from neuronhub.apps.jobs.services.send_job_alerts import send_job_alerts


logger = logging.getLogger(__name__)


monitor_config: MonitorConfig = {
    "schedule": {"type": "interval", "value": 1, "unit": "hour"},
    "max_runtime": 20,  # min
    "failure_issue_threshold": 3,
    "recovery_threshold": 2,
    "checkin_margin": 5,
}


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


@task()
async def send_job_alert_emails_by_ids_task(alert_ids: list[int]):
    logger.info(f"send_job_alert_emails_by_ids_task started for {len(alert_ids)} alerts")
    stats = await send_job_alerts(alert_ids=alert_ids)
    logger.info(f"send_job_alert_emails_by_ids_task report: {asdict(stats)}")
