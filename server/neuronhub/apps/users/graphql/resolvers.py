from typing import cast

import strawberry
import strawberry_django
from strawberry.types import Info
from strawberry_django.auth.utils import get_current_user, aget_current_user

from neuronhub.apps.users.graphql.types import UserType
from neuronhub.apps.users.models import User


def resolve_current_user(info: Info) -> UserType | None:
    # todo refac: drop if `strawberry_django/auth/queries.py::current_user` stops throwing Errors (still does)
    user = get_current_user(info)
    if getattr(user, "is_authenticated", False):
        return cast(UserType, user)
    return None


@strawberry.type(name="Query")
class UsersQuery:
    user_current: UserType | None = strawberry_django.field(resolver=resolve_current_user)


async def get_user(info: Info) -> User:
    user = await aget_current_user(info=info)
    return cast(User, user)
