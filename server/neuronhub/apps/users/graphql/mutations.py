from enum import Enum
from typing import cast

import strawberry
from asgiref.sync import sync_to_async
from strawberry import Info
from strawberry_django import auth
from strawberry_django.permissions import IsAuthenticated

from neuronhub.apps.users.graphql.types import UserType
from neuronhub.apps.users.graphql.types import UserTypeInput
from neuronhub.apps.users.models import User


class UserReviewListName(Enum):
    REVIEWS_READ_LATER = "reviews_read_later"
    REVIEWS_STARRED = "reviews_starred"
    REVIEWS_LIBRARY = "reviews_library"


@strawberry.type
class UserMutation:
    logout: bool = auth.logout()

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def update_user(
        self,
        data: UserTypeInput,
        info: Info,
    ) -> UserType:
        user: User = info.context.request.user

        user.first_name = data.first_name
        user.last_name = data.last_name
        await user.asave()

        return cast(UserType, user)

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def toggle_user_review_list(
        self,
        review_pk: strawberry.ID,
        review_list_name: UserReviewListName,
        is_added: bool,
        info: Info,
    ) -> bool:
        user: User = info.context.request.user
        if is_added:
            await sync_to_async(getattr(user, review_list_name.value).add)(review_pk)
        else:
            await sync_to_async(getattr(user, review_list_name.value).remove)(review_pk)
        return True
