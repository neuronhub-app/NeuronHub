from typing import cast

import strawberry
import strawberry_django
from algoliasearch.search.client import SearchClientSync
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from strawberry.types import Info
from strawberry_django.auth.utils import aget_current_user
from strawberry_django.auth.utils import get_current_user

from neuronhub.apps.users.graphql.types import UserType
from neuronhub.apps.users.models import User


def resolve_current_user(info: Info) -> UserType | None:
    # todo refac: drop if `strawberry_django/auth/queries.py::current_user` stops throwing Errors (still does)
    user = get_current_user(info)
    if getattr(user, "is_authenticated", False):
        return cast(UserType, user)
    return None


@strawberry.type
class AlgoliaSearchKeyType:
    api_key: str
    app_id: str
    index_name: str


@strawberry.type(name="Query")
class UsersQuery:
    user_current: UserType | None = strawberry_django.field(resolver=resolve_current_user)

    @strawberry.field(name="algolia_search_key")
    async def get_algolia_search_key_with_user_perms(
        self, info: Info
    ) -> AlgoliaSearchKeyType | None:
        if not settings.ALGOLIA["IS_ENABLED"]:
            return None

        user = await get_user_maybe(info)
        filters = ["visible_to:group/INTERNAL", "visible_to:group/PUBLIC"]
        if username := user.username:
            filters.append(f"visible_to:{username}")

        app_id = cast(str, settings.ALGOLIA["APPLICATION_ID"])
        search_api_key = cast(str, settings.ALGOLIA["SEARCH_API_KEY"])
        index_suffix = cast(str, settings.ALGOLIA["INDEX_SUFFIX"])

        client = SearchClientSync(app_id=app_id, api_key=search_api_key)
        key_with_perms = client.generate_secured_api_key(
            parent_api_key=search_api_key,
            restrictions={"filters": " OR ".join(filters)},
        )

        return AlgoliaSearchKeyType(
            api_key=key_with_perms,
            app_id=app_id,
            index_name=f"posts_{index_suffix}",
        )


async def get_user(info: Info) -> User:
    user = await aget_current_user(info=info)
    return cast(User, user)


async def get_user_maybe(info: Info) -> User | AnonymousUser:
    user = await aget_current_user(info=info)
    return cast(User | AnonymousUser, user)
