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

    def handle(self, *args, model: str, limit: int | None, **options):
        algolia_reindex_sync(
            models=[AlgoliaModel[model]] if model else None,
            limit=limit,
        )
