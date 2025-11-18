import strawberry_django
from strawberry import auto

from neuronhub.apps.importer.models import PostSource, UserSource


@strawberry_django.type(UserSource)
class UserSourceType:
    id: auto
    id_external: auto
    username: auto
    score: auto
    about: auto
    created_at_external: auto


@strawberry_django.order_type(PostSource)
class PostSourceOrder:
    created_at: auto
    updated_at: auto
    created_at_external: auto
    rank: auto
    score: auto


@strawberry_django.type(PostSource)
class PostSourceType:
    user_source: UserSourceType | None

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
