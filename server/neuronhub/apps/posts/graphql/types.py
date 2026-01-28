from __future__ import annotations

import logging
from typing import cast

import strawberry
import strawberry_django
from django.core.files.uploadedfile import UploadedFile
from django.db.models import F
from django.db.models import QuerySet
from strawberry import Info
from strawberry import auto
from strawberry_django.auth.utils import get_current_user

from neuronhub.apps.importer.graphql.types import PostSourceOrder
from neuronhub.apps.importer.graphql.types import PostSourceType
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
    id: auto
    parent_root_id: auto
    type: auto
    category: auto
    title: auto


@strawberry_django.order_type(Post)
class PostOrder:
    created_at: auto
    updated_at: auto
    post_source: PostSourceOrder


@strawberry_django.interface(Post)
class PostTypeI:
    TYPE: PostTypeEnum

    id: auto
    author: UserType | None
    seen_by_users: auto

    parent: PostTypeI | None
    parent_root: PostTypeI | None
    children: list[PostTypeI]

    type: auto
    category: auto

    title: auto
    content_polite: auto
    content_direct: auto
    content_rant: auto
    content_private: auto
    content_polite_html_ssr: auto
    image: auto
    comment_count: auto

    source: auto
    source_author: auto
    post_source: PostSourceType | None

    visibility: auto
    visible_to_users: list[UserType]
    visible_to_groups: list[UserConnectionGroupType]
    recommended_to_users: list[UserType]
    recommended_to_groups: list[UserConnectionGroupType]

    tags: list[PostTagType]  # type: ignore[assignment]
    votes: list[PostVoteType]
    tag_votes: list[PostTagVoteType]

    # Tool fields
    tool_type: auto
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
        return filter_posts_by_user(user, posts=queryset)

    @strawberry_django.field()
    async def comments(self: Post, info: Info) -> list[PostCommentType]:
        comments_qs = Post.objects.filter(parent_root=self, type=Post.Type.Comment)
        comments_filtered = filter_posts_by_user(user=get_current_user(info), posts=comments_qs)
        comments_ordered = comments_filtered.order_by(
            F("post_source__rank").desc(nulls_first=True)
        )
        return cast(list[PostCommentType], comments_ordered)


@strawberry_django.type(Post, filters=PostFilter, ordering=PostOrder)
class PostType(PostTypeI):
    TYPE = Post.Type.Post


@strawberry_django.type(Post, filters=PostFilter)
class PostToolType(PostTypeI):
    TYPE = Post.Type.Tool

    tool_type: auto

    # todo ! must be PostRelatedType
    alternatives: list[PostToolType]


@strawberry_django.order_type(Post)
class PostReviewOrder:
    reviewed_at: auto


@strawberry_django.type(Post, ordering=PostReviewOrder)
class PostReviewType(PostTypeI):
    TYPE = Post.Type.Review

    parent: PostToolType | None  # None when User has no access to it

    review_usage_status: auto
    review_rating: auto
    review_importance: auto
    review_experience_hours: auto
    review_tags: list[PostTagType]
    reviewed_at: auto
    is_review_later: auto


@strawberry_django.type(Post, filters=PostFilter, ordering=PostOrder)
class PostCommentType(PostTypeI):
    TYPE = Post.Type.Comment

    parent: PostTypeI | None


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
    type: auto
    category: auto

    parent: PostTypeInput | None
    alternatives: auto

    title: auto
    content_polite: auto
    content_direct: auto
    content_rant: auto
    content_private: str | None

    visibility: auto
    visible_to_users: auto
    visible_to_groups: auto
    recommended_to_users: auto
    recommended_to_groups: auto

    tags: list[PostTagTypeInput] | None

    source: auto
    source_author: auto
    image: UploadedFile | None

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


# ---------------------------------------------------------------
# PostTag
# ---------------------------------------------------------------


@strawberry_django.filter_type(PostTag, lookups=True)
class PostTagFilter:
    id: auto
    name: auto
    description: auto
    is_review_tag: auto


@strawberry_django.type(PostTag, filters=PostTagFilter)
class PostTagType:
    id: auto
    name: auto
    label: auto
    description: auto
    is_important: auto
    is_review_tag: auto

    posts: list[PostType]
    tag_parent: PostTagType | None
    tag_children: list[PostTagType]
    votes: list[PostTagVoteType]
    author: UserType | None


@strawberry_django.type(Post)
class PostSimpleType:
    """
    Created because using PostTypeI directly in PostTagVoteType.post breaks with the error below.

    > ValueError: Tried to prefetch 2 queries with different filters to the same attribute

    Prob the Strawberry optimizer + [[PostTypeI#get_queryset]] clash.
    """

    id: auto


@strawberry_django.type(PostTagVote)
class PostTagVoteType:
    id: auto
    tag: PostTagType
    author: UserType | None
    post: PostSimpleType

    is_vote_positive: auto
    is_changed_my_mind: auto


@strawberry_django.input(PostTag, partial=True)
class PostTagTypeInput:
    name: str
    id: strawberry.ID | None
    comment: str | None
    is_review_tag: bool | None
    is_vote_positive: bool | None
    is_important: bool | None
    tag_parent: PostTagTypeInput | None
