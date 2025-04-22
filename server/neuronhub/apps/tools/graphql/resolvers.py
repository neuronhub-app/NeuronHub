from __future__ import annotations

from typing import cast

import strawberry
import strawberry_django
from strawberry import Info
from strawberry_django.auth.utils import aget_current_user

from neuronhub.apps.tools.graphql.types import PostReviewType
from neuronhub.apps.tools.graphql.types import ToolTagType
from neuronhub.apps.tools.graphql.types import ToolType
from neuronhub.apps.tools.models import PostReview
from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.users.graphql.types import UserType


@strawberry.type(name="Query")
class ToolsQuery:
    me: UserType = strawberry_django.auth.current_user()

    tools: list[ToolType] = strawberry_django.field()
    tool: ToolType = strawberry_django.field()
    tool_tags: list[ToolTagType] = strawberry_django.field()

    @strawberry_django.field()
    async def tool_reviews(self, info: Info) -> list[PostReviewType]:
        if user := await aget_current_user(info):
            # todo !! permissions
            reviews = PostReview.objects.filter()
        else:
            reviews = PostReview.objects.filter(
                is_private=False,
                visibility=Visibility.PUBLIC,
            )
        return cast(list[PostReviewType], reviews.prefetch_related("comments"))

    @strawberry_django.field()
    async def tool_review(self, id: strawberry.ID, info: Info) -> PostReviewType:
        # todo !! permissions
        review = await PostReview.objects.filter(id=id).prefetch_related("comments").afirst()
        return cast(PostReviewType, review)
