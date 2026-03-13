from django.core.management.base import BaseCommand

from neuronhub.apps.jobs.tasks import send_job_alert_emails_task


class Command(BaseCommand):
    help = f"Enqueue {send_job_alert_emails_task.__name__} via django-tasks"

    def handle(self, *args, **options):
        send_job_alert_emails_task.enqueue()

        self.stdout.write(f"Enqueued {send_job_alert_emails_task.__name__}")
