from __future__ import annotations

from decimal import Decimal
from typing import TypedDict
from typing import cast

import strawberry
from asgiref.sync import sync_to_async
from strawberry import Info
from strawberry_django.permissions import IsAuthenticated

from neuronhub.apps.tools.services.create_review import create_review
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
        author: User = info.context.request.user

        review = await create_review(author, data)

        return cast(UserType, author)


@strawberry.type
class ToolReviewTypeInput:
    name: str | None
    description: str | None

    github_url: str | None
    domain: str | None

    title: str
    content: str | None
    content_private: str | None

    shared_user_ids: list[strawberry.ID]
    shared_org_ids: list[strawberry.ID]

    rating: Decimal
    rating_custom: dict

    is_private: bool | None

    tags: list[ToolTagTypeInput]

    alternatives: list[ToolReviewDraftAlternative]


@strawberry.type
class ToolTagTypeInput:
    id: strawberry.ID | None
    name: str | None
    description: str | None
    comment: str | None
    is_vote_positive: bool | None


class RatingCustom(TypedDict):
    value: Decimal
    comment: str
    is_private: bool


@strawberry.type
class ToolReviewDraftAlternative:
    tool_id: strawberry.ID
    tool_alternative_id: strawberry.ID
    is_vote_positive: bool


async def get_user(info: Info) -> User:
    user = await sync_to_async(getattr)(info.context.request, "user")
    return user
