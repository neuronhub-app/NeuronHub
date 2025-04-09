from __future__ import annotations

import strawberry_django
from strawberry import auto

from neuronhub.apps.users.models import User
from neuronhub.apps.users.models import UserConnectionGroup


@strawberry_django.type(User)
class UserType:
    id: auto
    first_name: auto
    last_name: auto
    name: auto
    email: auto
    connection_groups: list[UserConnectionGroupType]
    avatar: auto

    reviews_read_later: auto
    reviews_library: auto


@strawberry_django.type(UserConnectionGroup)
class UserConnectionGroupType:
    id: auto
    name: auto
    connections: list[UserType]


@strawberry_django.input(User, partial=True)
class UserTypeInput(UserType):
    first_name: auto
    last_name: auto
    connection_groups: list[UserType]

    reviews_read_later: auto
    reviews_library: auto
