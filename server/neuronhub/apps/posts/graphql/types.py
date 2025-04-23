from __future__ import annotations

import strawberry
import strawberry_django
from django.db.models import QuerySet
from strawberry import Info
from strawberry import auto

from neuronhub.apps.posts.models.posts import Post
from neuronhub.apps.posts.models.posts import PostTag
from neuronhub.apps.posts.models.posts import PostTagVote
from neuronhub.apps.posts.models.posts import PostVote
from neuronhub.apps.users.graphql.types import UserConnectionGroupType
from neuronhub.apps.users.graphql.types import UserType


@strawberry_django.type(Post)
class PostType:
    id: auto
    author: UserType
    seen_by_users: auto

    children: list[PostType]

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

    @classmethod
    def resolve_type(cls, value: Post, info: Info, parent_type) -> type[PostType]:
        assert isinstance(value, Post)
        match value.type:
            case Post.Type.Post:
                return PostType
            case Post.Type.Tool:
                return PostToolType
            case Post.Type.Review:
                return PostReviewType
            case Post.Type.Comment:
                return PostCommentType
            case _:
                raise TypeError()

    @classmethod
    def get_queryset(cls, qs: QuerySet[Post], info: Info) -> QuerySet[Post]:
        return qs


@strawberry_django.type(Post)
class PostToolType(PostType):
    tool_type: auto
    alternatives: list[PostToolType]

    company: auto
    domain: auto
    url: auto
    crunchbase_url: auto
    github_url: auto


@strawberry_django.type(Post)
class PostReviewType(PostType):
    parent: PostToolType | None

    review_usage_status: auto
    review_rating: auto
    review_importance: auto
    reviewed_at: auto


@strawberry_django.type(Post)
class PostCommentType(PostType):
    parent: PostCommentType | None
    children: list[PostCommentType]


@strawberry_django.type(PostVote)
class PostVoteType:
    id: auto
    post: PostType
    author: UserType
    is_vote_positive: auto
    is_changed_my_mind: auto


@strawberry_django.input(Post, partial=True)
class PostTypeInput:
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
    name: auto
    description: auto
    posts: list[PostType]
    tag_parent: PostTagType | None
    tag_children: list[PostTagType]
    author: UserType
    votes: list[PostTagVoteType]


@strawberry_django.type(PostTagVote)
class PostTagVoteType:
    id: auto
    author: UserType

    is_vote_positive: auto
    is_changed_my_mind: auto
    is_important: auto


@strawberry.input
class PostTagTypeInput:
    id: strawberry.ID | None
    name: str
    description: str
    is_vote_positive: bool | None
    is_important: bool | None
