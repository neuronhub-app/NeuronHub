from typing import cast

import strawberry
import strawberry_django
from strawberry import Info
from strawberry_django.auth.utils import aget_current_user

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.posts.graphql.types import PostType
from neuronhub.apps.posts.models import Post


@strawberry.type(name="Query")
class PostsQuery:
    @strawberry_django.field()
    async def posts(self, info: Info) -> list[PostType]:
        if user := await aget_current_user(info):
            # todo !! permissions
            posts = Post.objects.filter()
        else:
            posts = Post.objects.filter(
                is_private=False,
                visibility=Visibility.PUBLIC,
            )
        return cast(list[PostType], posts)

    @strawberry_django.field()
    async def post(self, id: strawberry.ID, info: Info) -> PostType:
        # todo !! permissions
        review = await Post.objects.filter(id=id).afirst()
        return cast(PostType, review)
