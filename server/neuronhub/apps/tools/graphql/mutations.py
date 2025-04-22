from __future__ import annotations

from decimal import Decimal
from typing import TypedDict
from typing import cast

import strawberry
import strawberry_django
from asgiref.sync import sync_to_async
from strawberry import Info
from strawberry import auto
from strawberry_django.permissions import IsAuthenticated

from neuronhub.apps.tools.models import Tool
from neuronhub.apps.tools.models import ToolAlternative
from neuronhub.apps.tools.models import ToolReview
from neuronhub.apps.tools.models import ToolReviewVote
from neuronhub.apps.users.graphql.types import UserType
from neuronhub.apps.users.models import User


@strawberry.type
class ToolsMutation:
    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def create_review(
        self,
        data: ToolReviewTypeInput,
        info: Info,
    ) -> UserType:
        from neuronhub.apps.tools.services.create_review import create_review

        author: User = info.context.request.user

        review = await create_review(author, data)

        return cast(UserType, author)

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def vote_review(
        self,
        id: strawberry.ID,
        is_vote_positive: bool | None,
        info: Info,
    ) -> bool:
        await ToolReviewVote.objects.aupdate_or_create(
            author=info.context.request.user,
            review_id=id,
            defaults={"is_vote_positive": is_vote_positive},
        )
        return True


@strawberry_django.input(Tool)
class ToolTypeInput:
    id: auto
    name: auto
    type: auto
    description: str | None

    github_url: auto
    crunchbase_url: auto

    alternatives: list[ToolAlternativeTypeInput] | None


@strawberry_django.input(ToolReview)
class ToolReviewTypeInput:
    id: auto
    tool: ToolTypeInput

    title: auto
    content: str | None
    content_private: str | None
    usage_status: auto
    source: auto
    reviewed_at: auto

    rating: auto
    importance: auto
    visibility: auto

    visible_to_users: auto
    visible_to_groups: auto

    recommended_to_users: auto
    recommended_to_groups: auto

    is_review_later: auto

    tags: list[ToolTagTypeInput] | None


@strawberry.input
class ToolTagTypeInput:
    id: strawberry.ID | None
    name: str
    description: str | None
    comment: str | None
    is_vote_positive: bool | None


class RatingCustom(TypedDict):
    value: Decimal
    comment: str
    is_private: bool


@strawberry_django.input(ToolAlternative)
class ToolAlternativeTypeInput:
    is_vote_positive: auto
    tool_alternative: auto
    comment: str | None


async def get_user(info: Info) -> User:
    user = await sync_to_async(getattr)(info.context.request, "user")
    return user
