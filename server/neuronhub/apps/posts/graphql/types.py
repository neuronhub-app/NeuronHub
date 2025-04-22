from __future__ import annotations
import typing

import strawberry_django
from strawberry import auto
from strawberry import lazy
from typing import Annotated

from neuronhub.apps.comments.graphql.types import CommentType
from neuronhub.apps.posts.models import Post
from neuronhub.apps.posts.models import PostVote
from neuronhub.apps.users.graphql.types import UserConnectionGroupType
from neuronhub.apps.users.graphql.types import UserType


if typing.TYPE_CHECKING:
    from neuronhub.apps.tools.graphql.types import ToolType


@strawberry_django.interface(Post)
class PostInterface:
    id: auto
    tool: Annotated[ToolType, lazy("neuronhub.apps.tools.graphql.types")] | None
    author: UserType

    title: auto
    content: auto

    source: auto
    updated_at: auto

    visibility: auto
    visible_to_users: list[UserType]
    visible_to_groups: list[UserConnectionGroupType]
    recommended_to_users: list[UserType]
    recommended_to_groups: list[UserConnectionGroupType]

    votes: list[PostVoteInterface]
    comments: list[CommentType]


@strawberry_django.interface(PostVote)
class PostVoteInterface:
    id: auto
    author: UserType
    is_vote_positive: auto


@strawberry_django.type(Post)
class PostType(PostInterface):
    id: auto


@strawberry_django.input(Post, partial=True)
class PostTypeInput:
    title: auto
    content: auto
