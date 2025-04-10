import strawberry_django
from strawberry import auto

from neuronhub.apps.tools.models import ToolReviewVote
from neuronhub.apps.users.models import User
from neuronhub.apps.users.models import UserConnectionGroup


@strawberry_django.type(UserConnectionGroup)
class UserConnectionGroupType:
    id: auto
    name: auto
    connections: list["UserType"]


@strawberry_django.type(ToolReviewVote)
class ToolReviewVoteType:
    """
    moving it to apps.tools breaks strawberry weird loading

    strawberry.lazy("neuronhub.apps.tools.resolvers") doesn't work. Neither does the string type, while it should.
    All other apps.tool types are in RAM, but ToolReviewVote is missing.

    Loads with this crunch. Whatever. Strawberry will prob fix it later.
    """

    id: auto
    review: auto
    is_vote_positive: auto


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

    tool_review_votes: list[ToolReviewVoteType]


@strawberry_django.input(User, partial=True)
class UserTypeInput(UserType):
    first_name: auto
    last_name: auto
    connection_groups: list[UserType]

    reviews_read_later: auto
    reviews_library: auto
