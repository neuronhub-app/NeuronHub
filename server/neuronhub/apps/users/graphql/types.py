import strawberry_django
from strawberry import auto

from neuronhub.apps.posts.graphql.types_lazy import PostVoteTypeLazy
from neuronhub.apps.posts.graphql.types_lazy import PostTagVoteTypeLazy
from neuronhub.apps.users.models import User
from neuronhub.apps.users.models import UserConnectionGroup


@strawberry_django.type(UserConnectionGroup)
class UserConnectionGroupType:
    id: auto
    name: auto
    connections: list["UserType"]


@strawberry_django.type(User)
class UserType:
    # todo feat: for privacy publish UUID / username (requires strawberry-django's M2M { set: ID } override)
    id: auto
    username: auto

    first_name: auto
    last_name: auto
    email: auto
    connection_groups: list[UserConnectionGroupType]
    avatar: auto

    post_votes: list[PostVoteTypeLazy] = strawberry_django.field()
    post_tag_votes: list[PostTagVoteTypeLazy] = strawberry_django.field()

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
