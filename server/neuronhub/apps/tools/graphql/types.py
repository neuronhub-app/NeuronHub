from __future__ import annotations

import strawberry_django
from strawberry import auto

from neuronhub.apps.posts.graphql.types import PostInterface
from neuronhub.apps.posts.graphql.types import PostVoteInterface
from neuronhub.apps.tools.models import PostReview
from neuronhub.apps.tools.models import PostReviewVote
from neuronhub.apps.tools.models import Tool
from neuronhub.apps.tools.models import ToolTag
from neuronhub.apps.tools.models import ToolTagVote
from neuronhub.apps.users.graphql.types import UserType


@strawberry_django.filter(Tool, lookups=True)
class ToolFilter:
    id: auto
    name: auto
    description: auto


@strawberry_django.type(Tool, filters=ToolFilter)
class ToolType:
    id: auto
    slug: auto
    name: auto
    crunchbase_url: auto
    github_url: auto

    description: auto

    alternatives: list[ToolType]

    tags: list[ToolTagType]


@strawberry_django.type(ToolTagVote)
class ToolTagVoteType:
    id: auto
    is_vote_positive: auto
    author: UserType


@strawberry_django.filter(ToolTag, lookups=True)
class ToolTagFilter:
    id: auto
    name: auto
    description: auto


@strawberry_django.type(ToolTag, filters=ToolTagFilter)
class ToolTagType:
    id: auto
    name: auto
    description: auto
    is_important: auto
    tools: list[ToolType]
    tag_parent: ToolTagType | None
    tag_children: list[ToolTagType]
    author: UserType
    votes: list[ToolTagVoteType]


# apps.reviews
# ==========================================================


@strawberry_django.type(PostReview)
class PostReviewType(PostInterface):
    reviewed_at: auto

    tool: ToolType

    rating: auto
    importance: auto
    experience_hours: auto

    usage_status: auto

    is_review_later: auto
    is_private: auto

    votes: list[PostReviewVoteType]


@strawberry_django.type(PostReviewVote)
class PostReviewVoteType(PostVoteInterface):
    pass
