from typing import cast

import strawberry
from strawberry import Info
from strawberry_django import mutations
from strawberry_django.auth.utils import aget_current_user
from strawberry_django.permissions import IsAuthenticated

from neuronhub.apps.posts.graphql.types import PostType
from neuronhub.apps.posts.graphql.types import PostTypeInput
from neuronhub.apps.posts.models import Post
from neuronhub.apps.posts.models.posts import PostVote, PostTagVote
from neuronhub.apps.posts.services.post_update_or_create import post_update_or_create
from neuronhub.apps.users.models import User


@strawberry.input
class DjangoModelInput:
    id: strawberry.ID


@strawberry.type
class PostsMutation:
    # todo ! fix(auth): permissions
    post_update: PostType = mutations.update(PostTypeInput, extensions=[IsAuthenticated()])
    post_delete: PostType = mutations.delete(DjangoModelInput, extensions=[IsAuthenticated()])

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def post_update_or_create(self, data: PostTypeInput, info: Info) -> PostType:
        user = await aget_current_user(info)
        post = await post_update_or_create(author=cast(User, user), data=data)
        return cast(PostType, post)

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def post_vote_update_or_create(
        self,
        id: strawberry.ID,
        is_vote_positive: bool | None,
        info: Info,
        is_changed_my_mind: bool | None = None,
    ) -> bool:
        await PostVote.objects.aupdate_or_create(
            post_id=id,
            author=info.context.request.user,
            defaults={
                "is_vote_positive": is_vote_positive,
                "is_changed_my_mind": is_changed_my_mind,
            },
        )
        return True

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def post_tag_vote_create_or_update(
        self,
        post_id: strawberry.ID,
        tag_id: strawberry.ID,
        is_vote_positive: bool | None,
        info: Info,
        comment: str | None = None,
    ) -> bool:
        await PostTagVote.objects.aupdate_or_create(
            post_id=post_id,
            tag_id=tag_id,
            author=info.context.request.user,
            defaults={
                "is_vote_positive": is_vote_positive,
                "comment": comment or "",
            },
        )
        return True

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def update_post_seen_status(self, id: strawberry.ID, info: Info) -> bool:
        user = await aget_current_user(info)
        post = await Post.objects.aget(id=id)
        await post.seen_by_users.aadd(user.id)
        return True
