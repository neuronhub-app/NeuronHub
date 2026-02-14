from typing import Literal

from algoliasearch_django import reindex_all
from django.core.management.base import BaseCommand

from neuronhub.apps.posts.index import setup_virtual_replica_sorted_by_votes
from neuronhub.apps.posts.models import Post
from neuronhub.apps.profiles.index import setup_replicas_sorted_by_scores
from neuronhub.apps.profiles.models import Profile


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument(
            "--model",
            type=str,
            default="Profile",
            choices=["Profile", "Post"],
        )

    def handle(self, *args, model: Literal["Profile", "Post"], **options):
        if model == "Profile":
            reindex_all(model=Profile)
            setup_replicas_sorted_by_scores()
        else:
            reindex_all(model=Post)
            setup_virtual_replica_sorted_by_votes()
