from typing import cast

import strawberry
import strawberry_django
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import AnonymousUser
from django.db.models import Q
from django.db.models import QuerySet
from strawberry.types import Info
from strawberry_django.auth.utils import aget_current_user

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.comments.graphql.types import CommentType
from neuronhub.apps.comments.models import Comment
from neuronhub.apps.tools.models import ToolReview


@strawberry.type(name="Query")
class CommentsQuery:
    @strawberry_django.field()
    async def comments_for_review(
        self,
        review_id: strawberry.ID,
        info: Info,
    ) -> list[CommentType]:
        review = await ToolReview.objects.aget(id=review_id)
        comments = review.comments.all()
        user = await aget_current_user(info)

        comments = await _get_review_comments(comments, user)

        return cast(list[CommentType], comments)


async def _get_review_comments(
    review: ToolReview,
    user: AbstractUser | AnonymousUser,
) -> QuerySet[Comment]:
    comments = review.comments.all()

    if user.is_authenticated:
        is_allowed_by_exception = Q(
            visibility=Visibility.USERS_SELECTED,
            visible_to_users__in=[user],
        )
        is_allowed_by_connection = Q(
            visibility=Visibility.CONNECTIONS,
            author__connection_group__connections__in=[user],
        )
        is_allowed_by_connection_group = Q(
            visibility=Visibility.CONNECTION_GROUPS,
            visible_to_groups__connections__in=[user],
        )
        comments = comments.filter(
            Q(author=user)
            | is_allowed_by_exception
            | is_allowed_by_connection
            | is_allowed_by_connection_group
            | Q(visibility__in=[Visibility.INTERNAL, Visibility.PUBLIC])
        )
    else:
        comments = comments.filter(visibility=Visibility.PUBLIC)

    comments = comments.prefetch_related("parent", "author")
    return comments
