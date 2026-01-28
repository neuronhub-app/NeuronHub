from typing import cast

import strawberry
import strawberry_django
from django.db.models import QuerySet
from strawberry import ID
from strawberry import Info
from strawberry import auto
from strawberry_django.permissions import IsAuthenticated

from neuronhub.apps.highlighter.models import PostHighlight
from neuronhub.apps.posts.graphql.mutations import DjangoModelInput
from neuronhub.apps.posts.graphql.types import PostTypeI
from neuronhub.apps.users.graphql.resolvers import get_user


@strawberry_django.order_type(PostHighlight)
class PostHighlightOrder:
    created_at: auto
    updated_at: auto


@strawberry_django.type(PostHighlight)
class PostHighlightType:
    id: auto
    post: PostTypeI
    user: auto

    text: auto
    text_prefix: auto
    text_postfix: auto
    created_at: auto


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
        highlights = [
            highlight
            async for highlight in PostHighlight.objects.filter(post_id__in=post_ids, user=user)
        ]
        return cast(list[PostHighlightType], highlights)

    @strawberry.field(extensions=[IsAuthenticated()])
    async def post_highlight(self, post_id: ID, info: Info) -> PostHighlightType:
        user = await get_user(info)
        highlight = await PostHighlight.objects.filter(post_id=post_id, user_id=user.id).aget()
        return cast(PostHighlightType, cast(object, highlight))

    # todo !! we have at least 5-level children #AI-slop
    @strawberry.field(extensions=[IsAuthenticated()])
    async def user_highlights(self, info: Info) -> list[PostHighlightType]:
        user = await get_user(info)
        highlights = [
            highlight
            async for highlight in PostHighlight.objects.filter(user=user, post__isnull=False)
            .select_related("post", "post__parent", "post__parent__parent")
            .order_by("-created_at")
        ]
        return cast(list[PostHighlightType], highlights)


@strawberry.type
class HighlighterMutation:
    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def post_highlight_create(self, data: PostHighlightTypeInput, info: Info) -> bool:
        user = await get_user(info)
        # todo !(sec): clean HTML. But atm PostHighlight has no sharing.
        # FE can't send HTML, but a bot/human will.
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
