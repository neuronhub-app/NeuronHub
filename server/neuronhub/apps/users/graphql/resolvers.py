from typing import cast

import strawberry
import strawberry_django
from strawberry.types import Info
from strawberry_django.auth.utils import get_current_user

from neuronhub.apps.users.graphql.types import UserType


def resolve_current_user(info: Info) -> UserType | None:
    """
    This is a copy of strawberry_django.auth.resolve_current_user(),
    but strawberry's version raises an error if the user isn't logged in, which we don't want.

    todo[refactor] check if still true
    """
    user = get_current_user(info)
    if getattr(user, "is_authenticated", False):
        return cast(UserType, user)
    return None


@strawberry.type(name="Query")
class UsersQuery:
    user_current: UserType | None = strawberry_django.field(resolver=resolve_current_user)
