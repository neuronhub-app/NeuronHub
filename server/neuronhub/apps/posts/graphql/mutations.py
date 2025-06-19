from typing import cast

import strawberry
from asgiref.sync import sync_to_async
from strawberry import Info
from strawberry_django.auth.utils import aget_current_user
from strawberry_django.permissions import IsAuthenticated

from neuronhub.apps.posts.graphql.types import PostCommentType
from neuronhub.apps.posts.graphql.types import PostType
from neuronhub.apps.posts.graphql.types import PostTypeInput
from neuronhub.apps.posts.models import Post
from neuronhub.apps.posts.models.posts import PostVote
from neuronhub.apps.posts.services.create_post_review import create_post_review
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
        review = await create_post_review(author, data)
        return cast(UserType, author)

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def create_post_review(
        self,
        data: PostTypeInput,
        info: Info,
    ) -> UserType:
        author: User = info.context.request.user
        review = await create_post_review(author, data)
        return cast(UserType, author)

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def create_post_comment(self, data: PostTypeInput, info: Info) -> PostCommentType:
        user = await aget_current_user(info)

        if not data.parent:
            raise ValueError("Parent is required for creating a comment")

        comment = await Post.objects.acreate(
            author=cast(User, user),
            parent=data.parent.id,
            content=data.content,
            visibility=data.visibility,
        )
        await sync_to_async(comment.visible_to_users.set)(data.visible_to_users)
        await sync_to_async(comment.visible_to_groups.set)(data.visible_to_groups)

        return cast(PostCommentType, comment)

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def update_post(self, data: PostTypeInput, info: Info) -> PostType:
        user = await aget_current_user(info)
        post = await Post.objects.aget(id=data.id)
        if post.author != user:
            raise PermissionError("Not author")

        post.content = data.content
        post.visibility = data.visibility
        await post.asave()

        await sync_to_async(post.visible_to_users.set)(data.visible_to_users)
        await sync_to_async(post.visible_to_groups.set)(data.visible_to_groups)

        return cast(PostType, post)

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
