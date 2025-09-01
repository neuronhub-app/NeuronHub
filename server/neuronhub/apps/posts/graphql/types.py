from __future__ import annotations

import logging

import strawberry
import strawberry_django
from asgiref.sync import async_to_sync
from django.db.models import QuerySet
from strawberry import Info
from strawberry import UNSET
from strawberry import auto
from strawberry_django.auth.utils import get_current_user

from neuronhub.apps.posts.models import PostTypeEnum
from neuronhub.apps.posts.models.posts import Post
from neuronhub.apps.posts.models.posts import PostTag
from neuronhub.apps.posts.models.posts import PostTagVote
from neuronhub.apps.posts.models.posts import PostVote
from neuronhub.apps.posts.services.filter_posts_by_user import filter_posts_by_user
from neuronhub.apps.users.graphql.types import UserConnectionGroupType
from neuronhub.apps.users.graphql.types import UserType


logger = logging.getLogger(__name__)


@strawberry_django.filter_type(Post, lookups=True)
class PostFilter:
    type: auto
    title: auto


# seems as a bug in PyCharm re PyDataclass
@strawberry_django.interface(Post)
class PostTypeI:
    TYPE: PostTypeEnum

    id: auto
    author: UserType
    seen_by_users: auto

    parent: PostTypeI | None
    children: list[PostTypeI]
    comments: list[PostCommentType] = strawberry_django.field(field_name="children")

    type: auto

    title: auto
    content: auto
    content_private: auto

    source: auto

    visibility: auto
    visible_to_users: list[UserType]
    visible_to_groups: list[UserConnectionGroupType]
    recommended_to_users: list[UserType]
    recommended_to_groups: list[UserConnectionGroupType]

    tags: list[PostTagType] = strawberry_django.field()
    votes: list[PostVoteType] = strawberry_django.field()
    tag_votes: list[PostTagVoteType] = strawberry_django.field()

    company: auto
    domain: auto
    url: auto
    crunchbase_url: auto
    github_url: auto

    created_at: auto
    updated_at: auto

    @classmethod
    def get_queryset(cls, queryset: QuerySet[Post], info: Info) -> QuerySet[Post]:
        user = get_current_user(info)
        if hasattr(cls, "TYPE"):
            queryset = queryset.filter(type=cls.TYPE)
        return async_to_sync(filter_posts_by_user)(user, posts=queryset)


@strawberry_django.type(Post, filters=PostFilter)
class PostType(PostTypeI):
    TYPE = Post.Type.Post


@strawberry_django.type(Post, filters=PostFilter)
class PostToolType(PostTypeI):
    TYPE = Post.Type.Tool

    tool_type: auto

    # todo !! must be PostRelatedType
    alternatives: list[PostToolType]


@strawberry_django.order_type(Post)
class PostReviewOrder:
    reviewed_at: auto


@strawberry_django.type(Post, ordering=PostReviewOrder)
class PostReviewType(PostTypeI):
    TYPE = Post.Type.Review

    parent: PostToolType

    review_usage_status: auto
    review_rating: auto
    review_importance: auto
    review_experience_hours: auto
    review_tags: list[PostTagType] = strawberry_django.field()
    reviewed_at: auto
    is_review_later: auto


# noinspection PyDataclass
@strawberry_django.type(Post, filters=PostFilter)
class PostCommentType(PostTypeI):
    TYPE = Post.Type.Comment

    parent: PostCommentType | None
    comments: list[PostCommentType] = strawberry_django.field(field_name="children")


@strawberry_django.type(PostVote)
class PostVoteType:
    id: auto
    post: PostTypeI
    author: UserType
    is_vote_positive: auto
    is_changed_my_mind: auto


@strawberry_django.input(Post, partial=True)
class PostTypeInput:
    id: auto

    parent: PostTypeInput | None
    alternatives: auto

    title: auto
    content: auto
    content_private: str | None

    visibility: auto
    visible_to_users: auto
    visible_to_groups: auto
    recommended_to_users: auto
    recommended_to_groups: auto

    tags: list[PostTagTypeInput] | None

    source: auto

    # review fields
    review_usage_status: auto
    review_rating: auto
    review_experience_hours: auto
    review_importance: auto
    review_tags: list[PostTagTypeInput] | None
    is_review_later: auto
    reviewed_at: auto

    # tool fields
    tool_type: auto
    domain: auto
    github_url: auto
    crunchbase_url: auto
    url: auto


# ---------------------
# PostTag
# ---------------------


@strawberry_django.filter_type(PostTag, lookups=True)
class PostTagFilter:
    id: auto
    name: auto
    description: auto
    is_review_tag: auto


@strawberry_django.type(PostTag, filters=PostTagFilter)
class PostTagType:
    id: auto
    posts: list[PostType]
    tag_parent: PostTagType | None = strawberry_django.field(
        disable_optimization=True,  # it helps, but `PostTag.label` prefetch_related() messes it up
    )
    tag_children: list[PostTagType]
    votes: list[PostTagVoteType]
    author: UserType

    name: auto
    description: auto
    is_important: auto
    is_review_tag: auto
    label: auto


@strawberry_django.type(PostTagVote)
class PostTagVoteType:
    id: auto
    post: PostTypeI
    tag: PostTagType
    author: UserType

    is_vote_positive: auto
    is_changed_my_mind: auto


@strawberry_django.input(PostTag, partial=True)
class PostTagTypeInput:
    name: str
    id: strawberry.ID | None = UNSET
    comment: str | None = UNSET
    is_vote_positive: bool | None = UNSET
    is_important: bool | None = UNSET
