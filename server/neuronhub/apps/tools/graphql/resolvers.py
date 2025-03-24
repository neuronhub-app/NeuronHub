from __future__ import annotations

import strawberry
import strawberry_django
from strawberry import auto

from neuronhub.apps.tools.models import Tool
from neuronhub.apps.tools.models import ToolReview
from neuronhub.apps.tools.models import ToolTag
from neuronhub.apps.users.graphql.types import UserConnectionGroupType
from neuronhub.apps.users.graphql.types import UserType


@strawberry_django.filter(Tool, lookups=True)
class ToolFilter:
    id: auto
    name: auto
    description: str | None


@strawberry_django.type(Tool, filters=ToolFilter)
class ToolType:
    id: auto
    slug: str | None
    name: auto
    crunchbase_url: auto
    github_url: auto

    description: str | None

    alternatives: list[ToolType]


@strawberry_django.type(ToolReview)
class ToolReviewType:
    id: auto
    reviewed_at: auto
    updated_at: auto

    tool: ToolType
    author: UserType

    source: auto

    title: auto
    content: str

    rating: auto
    rating_trust: auto

    is_review_later: auto
    is_private: auto

    tags: list[ToolTagType]

    importance: auto
    usage_status: auto
    visibility: auto

    visible_to_users: list[UserType]
    visible_to_groups: list[UserConnectionGroupType]
    recommended_to_users: list[UserType]
    recommended_to_groups: list[UserConnectionGroupType]


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
    tools: list[ToolType] = strawberry_django.field()
    tag_parent: ToolTagType = strawberry_django.field()
    tag_children: list[ToolTagType] = strawberry_django.field()
    author: UserType = strawberry_django.field()


@strawberry.type(name="Query")
class ToolsQuery:
    tools: list[ToolType] = strawberry_django.field()
    tool_reviews: list[ToolReviewType] = strawberry_django.field()
    tool: ToolType = strawberry_django.field()
    tool_tags: list[ToolTagType] = strawberry_django.field()
