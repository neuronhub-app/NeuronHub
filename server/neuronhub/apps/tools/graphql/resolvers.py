from __future__ import annotations

from typing import cast

import strawberry
import strawberry_django
from strawberry import Info
from strawberry import auto
from strawberry_django.auth.utils import aget_current_user

from neuronhub.apps.tools.models import Tool
from neuronhub.apps.tools.models import ToolReview
from neuronhub.apps.tools.models import ToolTag
from neuronhub.apps.tools.models import ToolTagVote
from neuronhub.apps.tools.models import Visibility
from neuronhub.apps.users.graphql.types import UserConnectionGroupType
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


@strawberry_django.type(ToolReview)
class ToolReviewType:
    id: auto
    reviewed_at: auto
    updated_at: auto

    tool: ToolType
    author: UserType

    source: auto

    title: auto
    content: auto
    content_pros: auto
    content_cons: auto

    rating: auto
    importance: auto
    experience_hours: auto

    usage_status: auto
    visibility: auto

    is_review_later: auto
    is_private: auto

    visible_to_users: list[UserType]
    visible_to_groups: list[UserConnectionGroupType]
    recommended_to_users: list[UserType]
    recommended_to_groups: list[UserConnectionGroupType]


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
    tag_parent: ToolTagType
    tag_children: list[ToolTagType]
    author: UserType
    votes: list[ToolTagVoteType]


@strawberry.type(name="Query")
class ToolsQuery:
    me: UserType = strawberry_django.auth.current_user()

    tools: list[ToolType] = strawberry_django.field()
    tool: ToolType = strawberry_django.field()
    tool_tags: list[ToolTagType] = strawberry_django.field()

    @strawberry_django.field()
    async def tool_reviews(self, info: Info) -> list[ToolReviewType]:
        if user := await aget_current_user(info):
            # todo !! filter by user
            reviews = ToolReview.objects.filter()
        else:
            reviews = ToolReview.objects.filter(
                is_private=False,
                visibility=Visibility.PUBLIC,
            )
        return cast(list[ToolReviewType], reviews)
