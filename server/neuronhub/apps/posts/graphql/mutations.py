from typing import cast

import strawberry
from asgiref.sync import sync_to_async
from strawberry import Info
from strawberry_django import mutations
from strawberry_django.auth.utils import aget_current_user
from strawberry_django.mutations import resolvers
from strawberry_django.permissions import IsAuthenticated

from neuronhub.apps.posts.graphql.types import PostCommentType
from neuronhub.apps.posts.graphql.types import PostType
from neuronhub.apps.posts.graphql.types import PostTypeInput
from neuronhub.apps.posts.models import Post
from neuronhub.apps.posts.models.posts import PostVote
from neuronhub.apps.posts.services.post_review_create_or_update import (
    post_review_create_or_update,
)
from neuronhub.apps.posts.services.create_post_comment import create_post_comment
from neuronhub.apps.users.models import User


@strawberry.input
class DjangoModelInput:
    id: strawberry.ID


@strawberry.type
class PostsMutation:
    update_post: PostType = mutations.update(PostTypeInput, extensions=[IsAuthenticated()])
    post_delete: PostType = mutations.delete(DjangoModelInput, extensions=[IsAuthenticated()])

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def create_post(
        self,
        data: PostTypeInput,
        info: Info,
    ) -> PostType:
        author: User = info.context.request.user
        res = await sync_to_async(resolvers.create)(
            info,
            model=Post,
            data={
                **vars(data),
                "type": Post.Type.Tool,
                "author": author,
            },
        )
        return cast(PostType, res)

    # todo ! (auth) check author on update
    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def post_review_create_or_update(
        self,
        data: PostTypeInput,
        info: Info,
    ) -> PostType:
        author: User = info.context.request.user
        review = await post_review_create_or_update(author, data)
        return cast(PostType, review)

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def create_post_comment(self, data: PostTypeInput, info: Info) -> PostCommentType:
        user = await aget_current_user(info)

        if not data.parent:
            raise ValueError("Parent is required for creating a comment")

        parent = await Post.objects.aget(id=data.parent.id)

        visible_to_users = (
            None if data.visible_to_users is strawberry.UNSET else data.visible_to_users
        )
        visible_to_groups = (
            None if data.visible_to_groups is strawberry.UNSET else data.visible_to_groups
        )

        comment = await create_post_comment(
            author=cast(User, user),
            parent=parent,
            content=data.content,
            visibility=data.visibility,
            visible_to_users=visible_to_users,
            visible_to_groups=visible_to_groups,
        )

        return cast(PostCommentType, comment)

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def create_or_update_post_vote(
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
    async def update_post_seen_status(self, id: strawberry.ID, info: Info) -> bool:
        user = await aget_current_user(info)
        post = await Post.objects.aget(id=id)
        await sync_to_async(post.seen_by_users.add)(cast(User, user).id)
        return True
