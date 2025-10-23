from typing import cast

import strawberry
import strawberry_django
from asgiref.sync import sync_to_async
from strawberry import auto, Info, ID
from strawberry_django.auth.utils import aget_current_user
from strawberry_django.permissions import IsAuthenticated

from neuronhub.apps.highlighter.models import PostHighlight
from neuronhub.apps.posts.graphql.mutations import DjangoModelInput
from neuronhub.apps.users.models import User


@strawberry_django.type(PostHighlight)
class PostHighlightType:
    id: auto
    post: auto
    user: auto

    text: auto
    text_prefix: auto
    text_postfix: auto


@strawberry_django.input(PostHighlight)
class PostHighlightTypeInput:
    post: auto

    text: auto
    text_prefix: auto
    text_postfix: auto


@strawberry.type(name="Query")
class HighlighterQuery:
    @strawberry.field(extensions=[IsAuthenticated()])
    async def post_highlights(self, post_ids: list[ID], info: Info) -> list[PostHighlightType]:
        user = await get_user(info)
        highlights = await sync_to_async(list)(  # type: ignore # a bug in sync_to_async typing
            PostHighlight.objects.filter(post_id__in=post_ids, user_id=user.id)
        )
        return cast(list[PostHighlightType], highlights)

    @strawberry.field(extensions=[IsAuthenticated()])
    async def post_highlight(self, post_id: ID, info: Info) -> PostHighlightType:
        user = await get_user(info)
        highlight = await PostHighlight.objects.filter(post_id=post_id, user_id=user.id).aget()
        return cast(PostHighlightType, highlight)


@strawberry.type
class HighlighterMutation:
    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def post_highlight_create(self, data: PostHighlightTypeInput, info: Info) -> bool:
        user = await get_user(info)
        await PostHighlight.objects.acreate(
            post_id=data.post.set,
            user=user,
            text=data.text,
            text_prefix=data.text_prefix,
            text_postfix=data.text_postfix,
        )
        return True

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def post_highlight_delete(self, data: DjangoModelInput, info: Info) -> bool:
        user = await get_user(info)
        await PostHighlight.objects.filter(id=data.id, user=user).adelete()
        return True


async def get_user(info: Info) -> User:
    user = await aget_current_user(info=info)
    return cast(User, user)
