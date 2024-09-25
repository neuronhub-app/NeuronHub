from typing import cast

import strawberry
from strawberry import Info
from strawberry_django import auth
from strawberry_django.permissions import IsAuthenticated

from axonhub.apps.users.graphql.types import UserType
from axonhub.apps.users.graphql.types import UserTypeInput
from axonhub.apps.users.models import User


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
