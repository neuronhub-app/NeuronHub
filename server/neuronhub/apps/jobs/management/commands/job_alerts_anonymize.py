from asgiref.sync import async_to_sync
from django.core.management.base import BaseCommand

from neuronhub.apps.jobs.models import JobAlert
from neuronhub.apps.users.models import UserAnon


class Command(BaseCommand):
    help = "Anonymize all JobAlert emails via UserAnon"

    def handle(self, *args, **options):
        count = _anonymize_all()
        self.stdout.write(f"Anonymized {count} JobAlerts")


@async_to_sync
async def _anonymize_all():
    count = 0
    async for job_alert in JobAlert.objects.all():
        user_anon = await UserAnon.get_or_create_from_email(job_alert.email)
        job_alert.email = f"{user_anon.anon_name}@localhost"
        await job_alert.asave(update_fields=["email"])
        count += 1
    return count
