from typing import cast

import strawberry
from asgiref.sync import sync_to_async
from django.contrib.auth import aauthenticate, alogin
from strawberry import Info
from strawberry_django import auth
from strawberry_django.permissions import IsAuthenticated

from neuronhub.apps.users.graphql.types_lazy import UserListName
from neuronhub.apps.users.graphql.types import UserType
from neuronhub.apps.users.graphql.types import UserTypeInput
from neuronhub.apps.users.models import User


@strawberry.input
class LoginInput:
    username_or_email: str
    password: str


@strawberry.type
class LoginResponse:
    success: bool
    user: UserType | None = None
    error: str | None = None


@strawberry.type
class UserMutation:
    logout: bool = auth.logout()

    @strawberry.mutation()
    async def login(self, data: LoginInput, info: Info) -> LoginResponse:
        username = data.username_or_email
        if "@" in username:
            if user := await User.objects.filter(email=data.username_or_email).afirst():
                username = user.username

        if user := await aauthenticate(
            request=info.context.request,
            username=username,
            password=data.password,
        ):
            await alogin(info.context.request, user)
            return LoginResponse(success=True, user=cast(UserType, user))

        return LoginResponse(success=False, error="Invalid credentials")

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
    async def update_user_list(
        self,
        id: strawberry.ID,
        list_field_name: UserListName,
        is_added: bool,
        info: Info,
    ) -> bool:
        user: User = info.context.request.user

        field_name = list_field_name.value
        assert getattr(user, field_name), f"Check User.{field_name} field existence"

        if is_added:
            await sync_to_async(getattr(user, field_name).add)(id)
        else:
            await sync_to_async(getattr(user, field_name).remove)(id)
        return True
