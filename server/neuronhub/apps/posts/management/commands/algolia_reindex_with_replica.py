from django.core.management import call_command
from django.core.management.base import BaseCommand

from neuronhub.apps.posts.index import setup_virtual_replica_sorted_by_votes


class Command(BaseCommand):
    def handle(self, *args, **options):
        call_command("algolia_reindex")

        self.stdout.write("Virtual replica: configuring...")
        setup_virtual_replica_sorted_by_votes()
        self.stdout.write(self.style.SUCCESS("Virtual replica: configured."))
