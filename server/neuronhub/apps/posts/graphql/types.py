from __future__ import annotations


import strawberry
import strawberry_django
from asgiref.sync import async_to_sync
from django.db.models import QuerySet
from strawberry import Info
from strawberry import auto
from strawberry_django.auth.utils import get_current_user

from neuronhub.apps.posts.models.posts import Post
from neuronhub.apps.posts.models.posts import PostTag
from neuronhub.apps.posts.models.posts import PostTagVote
from neuronhub.apps.posts.models.posts import PostVote
from neuronhub.apps.posts.services.filter_posts_by_user import filter_posts_by_user
from neuronhub.apps.users.graphql.types import UserConnectionGroupType
from neuronhub.apps.users.graphql.types import UserType


@strawberry_django.filter_type(Post, lookups=True)
class PostFilter:
    type: auto
    title: auto


# seems as a bug in PyCharm re PyDataclass
# noinspection PyDataclass
@strawberry_django.interface(Post)
class PostTypeI:
    TYPE: Post.Type = Post.Type.Post

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
    updated_at: auto

    visibility: auto
    visible_to_users: list[UserType]
    visible_to_groups: list[UserConnectionGroupType]
    recommended_to_users: list[UserType]
    recommended_to_groups: list[UserConnectionGroupType]

    tags: list[PostTagType]
    votes: list[PostVoteType]
    tag_votes: list[PostTagVoteType]

    company: auto
    domain: auto
    url: auto
    crunchbase_url: auto
    github_url: auto

    created_at: auto
    updated_at: auto

    @classmethod
    def get_queryset(cls, queryset: QuerySet[Post], info: Info) -> QuerySet[Post]:
        if not cls.TYPE:
            raise NotImplementedError("Define TYPE.")
        user = get_current_user(info)
        return async_to_sync(filter_posts_by_user)(user, posts=queryset.filter(type=cls.TYPE))


@strawberry_django.type(Post, filters=PostFilter)
class PostType(PostTypeI):
    TYPE = Post.Type.Post


# noinspection PyDataclass
@strawberry_django.type(Post, filters=PostFilter)
class PostToolType(PostTypeI):
    TYPE = Post.Type.Tool

    tool_type: auto

    # todo !! must be PostRelatedType
    alternatives: list[PostToolType]


# noinspection PyDataclass
@strawberry_django.type(Post)
class PostReviewType(PostTypeI):
    TYPE = Post.Type.Review

    parent: PostToolType | None

    review_usage_status: auto
    review_rating: auto
    review_importance: auto
    review_experience_hours: auto
    reviewed_at: auto


# noinspection PyDataclass
@strawberry_django.type(Post, filters=PostFilter)
class PostCommentType(PostTypeI):
    TYPE = Post.Type.Comment

    parent: PostCommentType | None
    children: list[PostCommentType]


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
    tool_type: auto

    parent: auto
    children: auto
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

    seen_by_users: auto

    # review fields
    review_usage_status: auto
    review_rating: auto
    review_experience_hours: auto
    review_importance: auto
    reviewed_at: auto

    # tool fields
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


@strawberry_django.type(PostTag, filters=PostTagFilter)
class PostTagType:
    id: auto
    posts: list[PostType]
    tag_parent: PostTagType | None
    votes: list[PostTagVoteType]
    tag_children: list[PostTagType]
    author: UserType

    name: auto
    description: auto
    is_important: auto


@strawberry_django.type(PostTagVote)
class PostTagVoteType:
    id: auto
    author: UserType

    is_vote_positive: auto
    is_changed_my_mind: auto


@strawberry.input
class PostTagTypeInput:
    id: strawberry.ID | None
    name: str
    comment: str | None
    is_vote_positive: bool | None
    is_important: bool | None
