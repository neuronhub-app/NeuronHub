import logging

from django_tasks import task

from neuronhub.apps.jobs.services.send_alert_email import send_job_alert_emails


logger = logging.getLogger(__name__)


@task()
async def send_job_alert_emails_task():
    logger.info("Job alerts sending started")
    stats = await send_job_alert_emails()
    logger.info(
        f"Job alerts report: sent = {stats.sent}, failed = {stats.failed}, not matched = {stats.skipped}"
    )
