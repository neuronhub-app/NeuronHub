from django.core.management.base import BaseCommand

from neuronhub.apps.algolia.services.algolia_reindex import AlgoliaModel
from neuronhub.apps.algolia.services.algolia_reindex import algolia_reindex_sync


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            "--model",
            type=str,
            default="",
            choices=["Profile", "Post", "Job"],
        )
        parser.add_argument(
            "--limit",
            type=int,
            default=None,
            help="partial_update_objects on first N records instead of full reindex",
        )
        parser.add_argument(
            "--batch_size",
            type=int,
            default=1000,
            help="Reduce from 1000 if you're running out of RAM on execute",
        )

    def handle(self, *args, model: str, limit: int | None, batch_size: int = 1000, **options):
        algolia_reindex_sync(
            models=[AlgoliaModel[model]] if model else None,
            limit=limit,
            batch_size=batch_size,
        )
