from __future__ import annotations

import typing

from strawberry import UNSET

from neuronhub.apps.posts.models import Post
from neuronhub.apps.posts.services.review_create_or_update import _tag_create_or_update
from neuronhub.apps.users.models import User

if typing.TYPE_CHECKING:
    from neuronhub.apps.posts.graphql.types import PostTypeInput


async def post_create(author: User, data: PostTypeInput) -> Post:
    field_values = {}
    for field, value in [
        ("type", data.type),
        ("title", data.title),
        ("source", data.source),
        ("content", data.content),
        ("content_private", data.content_private),
        ("visibility", data.visibility),
        ("image", data.image),
    ]:
        if value is not UNSET:
            field_values[field] = value

    post = await Post.objects.acreate(**field_values, author=author)

    if data.tags:
        tags = [
            await _tag_create_or_update(tag_input, post=post, author=author)
            for tag_input in data.tags
        ]
        await post.tags.aset(tags)

    return post
