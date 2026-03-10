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

    def handle(self, *args, model: str, **options):
        if model:
            algolia_reindex_sync(model=AlgoliaModel[model])
        else:
            for algolia_model in AlgoliaModel:
                algolia_reindex_sync(model=algolia_model)
