from __future__ import annotations
import strawberry_django
from strawberry import auto

from neuronhub.apps.comments.models import Comment
from neuronhub.apps.comments.models import CommentVote
from neuronhub.apps.users.graphql.types import UserType


@strawberry_django.type(Comment)
class CommentType:
    id: auto
    parent: CommentType | None

    visibility: auto

    author: UserType

    seen_by_users: auto

    content: auto

    created_at: auto
    updated_at: auto


@strawberry_django.input(Comment, partial=True)
class CommentTypeInput:
    id: auto

    parent: CommentType | None

    visibility: auto
    visible_to_users: auto
    visible_to_groups: auto

    author: UserType

    seen_by_users: auto

    content: auto


@strawberry_django.type(CommentVote)
class CommentVoteType:
    id: auto
    comment: auto
    is_vote_positive: auto
    is_vote_changed_my_mind: auto
