from typing import cast

import strawberry
from asgiref.sync import sync_to_async
from strawberry import Info
from strawberry_django.auth.utils import aget_current_user
from strawberry_django.permissions import IsAuthenticated

from neuronhub.apps.comments.graphql.types import CommentType
from neuronhub.apps.comments.graphql.types import CommentTypeInput
from neuronhub.apps.comments.models import Comment
from neuronhub.apps.comments.models import CommentVote


@strawberry.type
class CommentMutation:
    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def update_comment(self, data: CommentTypeInput, info: Info) -> CommentType:
        user = await aget_current_user(info)
        comment = await Comment.objects.aget(pk=data.id)
        if comment.author != user:
            raise PermissionError("Not author")

        comment.content = data.content
        comment.visibility = data.visibility
        await comment.asave()

        await sync_to_async(comment.visible_to_users.set)(data.visible_to_users)
        await sync_to_async(comment.visible_to_groups.set)(data.visible_to_groups)

        return cast(CommentType, comment)

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def create_comment(self, data: CommentTypeInput, info: Info) -> CommentType:
        user = await aget_current_user(info)

        comment = await Comment.objects.acreate(
            author=user,
            parent=data.parent.id,
            content=data.content,
            visibility=data.visibility,
        )
        await sync_to_async(comment.visible_to_users.set)(data.visible_to_users)
        await sync_to_async(comment.visible_to_groups.set)(data.visible_to_groups)

        return cast(CommentType, comment)

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def update_comment_seen_status(self, comment_id: strawberry.ID, info: Info) -> bool:
        user = await aget_current_user(info)
        comment = await Comment.objects.aget(id=comment_id)
        await sync_to_async(comment.seen_by_users.add)(user.id)
        return True

    @strawberry.mutation(extensions=[IsAuthenticated()])
    async def update_comment_vote(
        self,
        info: Info,
        comment_id: strawberry.ID,
        is_vote_positive: bool | None = None,
        is_vote_changed_my_mind: bool = False,
    ) -> bool:
        await CommentVote.objects.aupdate_or_create(
            author=await aget_current_user(info),
            comment_id=comment_id,
            defaults={
                "is_vote_positive": is_vote_positive,
                "is_vote_changed_my_mind": is_vote_changed_my_mind,
            },
        )
        return True
