import logging
import typing

import strawberry
import strawberry_django

from neuronhub.apps.posts.graphql.types import PostCommentType
from neuronhub.apps.posts.graphql.types import PostReviewType
from neuronhub.apps.posts.graphql.types import PostTagType
from neuronhub.apps.posts.graphql.types import PostToolType
from neuronhub.apps.posts.graphql.types import PostType
from neuronhub.apps.posts.graphql.types import PostTypeI


if typing.TYPE_CHECKING:
    from strawberry.types.base import WithStrawberryObjectDefinition  # noqa: F401 - not sure for what


logger = logging.getLogger(__name__)


@strawberry.type(name="Query")
class PostsQuery:
    post_generic: PostTypeI | None = strawberry_django.field()
    post: PostType | None = strawberry_django.field()
    post_tool: PostToolType | None = strawberry_django.field()
    post_review: PostReviewType | None = strawberry_django.field()
    post_comment: PostCommentType | None = strawberry_django.field()

    posts: list[PostType] = strawberry_django.field()
    post_tools: list[PostToolType] = strawberry_django.field()
    post_reviews: list[PostReviewType] = strawberry_django.field()
    post_comments: list[PostCommentType] = strawberry_django.field()

    tags: list[PostTagType] = strawberry_django.field()
