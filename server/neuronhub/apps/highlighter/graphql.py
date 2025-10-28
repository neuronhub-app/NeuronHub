from typing import cast

import strawberry
import strawberry_django
from django.db.models import QuerySet
from strawberry import ID
from strawberry import Info
from strawberry import auto
from strawberry_django.auth.utils import aget_current_user
from strawberry_django.permissions import IsAuthenticated

from neuronhub.apps.highlighter.models import PostHighlight
from neuronhub.apps.posts.graphql.mutations import DjangoModelInput
from neuronhub.apps.posts.graphql.types import PostTypeI
from neuronhub.apps.posts.models import Post
from neuronhub.apps.users.models import User


@strawberry_django.type(PostHighlight)
class PostHighlightType:
    id: auto
    post: PostTypeI
    user: auto

    text: auto
    text_prefix: auto
    text_postfix: auto
    created_at: auto

    # todo !(fix) #AI-slop: add a field to Post<Comment> eg as `parent_root`, and just set it on all Post instances
    @strawberry_django.field(
        select_related=[
            # depth = 8
            "parent__parent__parent__parent__parent__parent__parent__parent__user",
        ]
    )
    def root_post(self) -> PostTypeI:
        """
        HackerNews has no depth limit.

        From LLM (Opus):
        > HN drops CSS indents after depth > 5-6.
        > Stats:
        > - median ≈ 3-4
        > - 99.0%  < 8
        > - 99.9%  < 12
        > - max    ≳ 15-20
        """
        post_current = self.post
        depth = 0
        while depth < 20:
            if post_current.parent:
                is_root = post_current.parent.type is not Post.Type.Comment
                if is_root:
                    return post_current

            if not post_current.parent:
                return post_current

            # recurse deeper
            depth += 1
            post_current = post_current.parent
        return post_current


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
        highlights = await _async_query_queryset(
            queryset=PostHighlight.objects.filter(post_id__in=post_ids, user=user)
        )
        return cast(list[PostHighlightType], cast(object, highlights))

    @strawberry.field(extensions=[IsAuthenticated()])
    async def post_highlight(self, post_id: ID, info: Info) -> PostHighlightType:
        user = await get_user(info)
        highlight = await PostHighlight.objects.filter(post_id=post_id, user_id=user.id).aget()
        return cast(PostHighlightType, cast(object, highlight))

    # todo !! we have at least 5-level children #AI-slop
    @strawberry.field(extensions=[IsAuthenticated()])
    async def user_highlights(self, info: Info) -> list[PostHighlightType]:
        user = await get_user(info)
        highlights = await _async_query_queryset(
            queryset=PostHighlight.objects.filter(user=user)
            .select_related("post", "post__parent", "post__parent__parent")
            .order_by("-created_at")
        )
        return cast(list[PostHighlightType], cast(object, highlights))


async def _async_query_queryset(queryset: QuerySet[PostHighlight]) -> list[PostHighlight]:
    return [highlight async for highlight in queryset]


@strawberry.type
class HighlighterMutation:
    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def post_highlight_create(self, data: PostHighlightTypeInput, info: Info) -> bool:
        user = await get_user(info)
        # todo !(sec): clean HTML
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
