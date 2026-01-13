from algoliasearch_django import reindex_all
from django_tasks import task

from neuronhub.apps.posts.index import setup_virtual_replica_sorted_by_votes
from neuronhub.apps.posts.models import Post


@task()
def reindex_algolia():
    reindex_all(Post)
    setup_virtual_replica_sorted_by_votes()
