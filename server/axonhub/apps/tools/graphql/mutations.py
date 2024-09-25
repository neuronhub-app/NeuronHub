from __future__ import annotations

from decimal import Decimal
from typing import TypedDict
from typing import cast

import strawberry
from strawberry import Info
from strawberry_django.permissions import IsAuthenticated

from axonhub.apps.users.graphql.types import UserType
from axonhub.apps.users.graphql.types import UserTypeInput
from axonhub.apps.users.models import User


@strawberry.type
class ToolsMutation:
    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def save_tool_review_draft(
        self,
        data: UserTypeInput,
        info: Info,
    ) -> UserType:
        """
        Auto-create the tool if doesn't exist.
        - if github url - import
        """
        user: User = info.context.request.user

        user.first_name = data.first_name
        user.last_name = data.last_name
        await user.asave()

        return cast(UserType, user)

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def save_tool_review(
        self,
        data: UserTypeInput,
        info: Info,
    ) -> UserType:
        """
        Auto-create the tool if doesn't exist.
        - if github url - import
        """
        user: User = info.context.request.user

        user.first_name = data.first_name
        user.last_name = data.last_name
        await user.asave()

        return cast(UserType, user)


@strawberry.type
class ToolReviewDraft:
    id: strawberry.ID | None

    shared_org_ids: list[strawberry.ID]
    shared_user_ids: list[strawberry.ID]

    github_url: str

    title: str | None
    content: str | None
    content_personal: str | None

    rating: Decimal | None
    rating_custom: dict

    is_private: bool

    alternatives: list[ToolReviewDraftAlternative]


class RatingCustom(TypedDict):
    value: Decimal
    comment: str
    is_private: bool


@strawberry.type
class ToolReviewDraftAlternative:
    tool_id: strawberry.ID
    tool_alternative_id: strawberry.ID
    is_vote_positive: bool
