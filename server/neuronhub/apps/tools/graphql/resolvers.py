from __future__ import annotations

import strawberry
import strawberry_django
from strawberry import auto

from neuronhub.apps.tools.models import Tool
from neuronhub.apps.tools.models import ToolTag
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
    domain: auto
    crunchbase_url: auto
    github_url: auto

    description: str | None

    alternatives: list[ToolType]


@strawberry_django.filter(ToolTag, lookups=True)
class ToolTagFilter:
    id: auto
    name: auto
    description: auto


@strawberry_django.type(
    ToolTag,
    fields=[
        "id",
        "name",
        "description",
    ],
    filters=ToolTagFilter,
)
class ToolTagType:
    tools: list[ToolType] = strawberry_django.field()
    tag_parent: ToolTagType = strawberry_django.field()
    tag_children: list[ToolTagType] = strawberry_django.field()
    author: UserType = strawberry_django.field()


@strawberry.type(name="Query")
class ToolsQuery:
    tools: list[ToolType] = strawberry_django.field()
    tool: ToolType = strawberry_django.field()
    tool_tags: list[ToolTagType] = strawberry_django.field()
