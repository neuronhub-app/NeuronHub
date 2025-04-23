import logging
from typing import cast

import strawberry
import strawberry_django
from strawberry import Info
from strawberry_django.auth.utils import aget_current_user

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.posts.graphql.types import PostTagType
from neuronhub.apps.posts.graphql.types import PostType
from neuronhub.apps.posts.models.posts import Post

from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import AnonymousUser
from django.db.models import Q
from django.db.models import QuerySet


logger = logging.getLogger(__name__)


@strawberry.type(name="Query")
class PostsQuery:
    tags: list[PostTagType] = strawberry_django.field()

    @strawberry_django.field()
    async def posts(self, info: Info) -> list[PostType]:
        if user := await aget_current_user(info):
            # todo !! permissions
            posts = Post.posts.filter()
        else:
            posts = Post.posts.filter(
                is_private=False,
                visibility=Visibility.PUBLIC,
            )
        return cast(list[PostType], posts)

    @strawberry_django.field()
    async def post(self, id: strawberry.ID, info: Info) -> PostType:
        # todo !! permissions
        review = await Post.posts.filter(id=id).afirst()
        return cast(PostType, review)

    @strawberry_django.field()
    async def comments(
        self,
        post_id: strawberry.ID,
        info: Info,
    ) -> list[PostType]:
        comments = await get_comments_visible(
            post=await Post.comments.aget(id=post_id),
            user=await aget_current_user(info),
        )
        return cast(list[PostType], comments)


async def get_comments_visible(post: Post, user: AbstractUser | AnonymousUser) -> QuerySet[Post]:
    return await posts_filter_by_user(posts=post.children.all(), user=user)


async def posts_filter_by_user(
    posts: QuerySet[Post] | QuerySet[Post, Post],
    user: AbstractUser | AnonymousUser,
) -> QuerySet[Post]:
    if user.is_authenticated:
        is_own_post = Q(author=user)
        is_allowed_as_a_user_selected = Q(
            visibility=Visibility.USERS_SELECTED,
            visible_to_users__in=[user],
        )
        is_allowed_as_a_connection_group_selected = Q(
            visibility=Visibility.CONNECTION_GROUPS_SELECTED,
            visible_to_groups__connections__in=[user],
        )
        is_allowed_as_a_connection = Q(
            visibility=Visibility.CONNECTIONS,
            author__connection_group__connections__in=[user],
        )
        is_publicly_visible = Q(visibility__in=[Visibility.INTERNAL, Visibility.PUBLIC])

        posts = posts.filter(
            is_own_post
            | is_allowed_as_a_user_selected
            | is_allowed_as_a_connection_group_selected
            | is_allowed_as_a_connection
            | is_publicly_visible
        )
    else:
        posts = posts.filter(visibility=Visibility.PUBLIC)

    posts = posts.prefetch_related("parent", "author")
    return posts
