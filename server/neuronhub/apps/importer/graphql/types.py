import strawberry
import strawberry_django
from strawberry import auto

from neuronhub.apps.importer.models import PostSource
from neuronhub.apps.importer.models import UserSource


@strawberry.type
class UserSourceTypeBase:
    id: int
    username: str
    score: int


@strawberry_django.type(UserSource)
class UserSourceType(UserSourceTypeBase):
    id_external: auto
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
class PostSourceTypeBase:
    id: auto
    user_source: UserSourceTypeBase | None
    id_external: auto
    score: auto
    rank: auto
    url_of_source: auto
    created_at_external: auto


@strawberry_django.type(PostSource)
class PostSourceType(PostSourceTypeBase):
    user_source: UserSourceType | None
    post: auto
    domain: auto
    url: auto
    json: auto
    created_at: auto
    updated_at: auto
