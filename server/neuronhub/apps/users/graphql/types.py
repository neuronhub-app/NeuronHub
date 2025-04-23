import strawberry_django
from strawberry import auto

from neuronhub.apps.posts.graphql.types_lazy import PostVoteTypeLazy
from neuronhub.apps.users.models import User
from neuronhub.apps.users.models import UserConnectionGroup


@strawberry_django.type(UserConnectionGroup)
class UserConnectionGroupType:
    id: auto
    name: auto
    connections: list["UserType"]


@strawberry_django.type(User)
class UserType:
    # for privacy only username is exposed
    id: auto = strawberry_django.field(field_name="username")
    username: auto

    first_name: auto
    last_name: auto
    email: auto
    connection_groups: list[UserConnectionGroupType]
    avatar: auto

    post_votes: list[PostVoteTypeLazy]

    read_later: auto
    library: auto


@strawberry_django.input(User, partial=True)
class UserTypeInput:
    username: auto
    first_name: auto
    last_name: auto
    email: auto
    connection_groups: list[UserConnectionGroupType]
    avatar: auto

    read_later: auto
    library: auto
