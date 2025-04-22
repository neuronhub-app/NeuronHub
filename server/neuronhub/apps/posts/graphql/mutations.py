from typing import cast

import strawberry
from strawberry import Info
from strawberry_django.permissions import IsAuthenticated

from neuronhub.apps.posts.graphql.types import PostTypeInput
from neuronhub.apps.posts.models import PostVote
from neuronhub.apps.users.graphql.types import UserType
from neuronhub.apps.users.models import User


@strawberry.type
class PostsMutation:
    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def create_post(
        self,
        data: PostTypeInput,
        info: Info,
    ) -> UserType:
        author: User = info.context.request.user

        return cast(UserType, author)

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def vote_post(
        self,
        id: strawberry.ID,
        is_vote_positive: bool | None,
        info: Info,
    ) -> bool:
        await PostVote.objects.aupdate_or_create(
            author=info.context.request.user,
            post_id=id,
            defaults={"is_vote_positive": is_vote_positive},
        )
        return True
