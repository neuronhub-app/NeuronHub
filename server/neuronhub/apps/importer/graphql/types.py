import strawberry_django
from strawberry import auto

from neuronhub.apps.importer.models import PostSource


@strawberry_django.order_type(PostSource)
class PostSourceOrder:
    created_at: auto
    updated_at: auto
    created_at_external: auto
    rank: auto
    score: auto


@strawberry_django.type(PostSource)
class PostSourceType:
    id: auto
    post: auto
    domain: auto
    id_external: auto
    rank: auto
    url: auto
    url_of_source: auto
    score: auto
    json: auto
    created_at_external: auto
    created_at: auto
    updated_at: auto
