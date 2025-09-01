"""
#AI

Prob most of this file is redundant, ie Strawberry + BasePermission can be ~enough.

But `tags` are different - the separator `/` must be parsed on backend/frontend.
"""

from __future__ import annotations

import typing

from strawberry import UNSET

from neuronhub.apps.posts.models import Post, PostRelated
from neuronhub.apps.posts.services.create_tag import create_tag
from neuronhub.apps.users.models import User

if typing.TYPE_CHECKING:
    from neuronhub.apps.posts.graphql.types import PostTypeInput


async def post_review_create_or_update(author: User, data: PostTypeInput) -> Post:
    field_values = {}
    for field, value in [
        ("title", data.title),
        ("source", data.source),
        ("content", data.content),
        ("content_private", data.content_private),
        ("visibility", data.visibility),
        ("review_rating", data.review_rating),
        ("review_usage_status", data.review_usage_status),
        ("review_importance", data.review_importance),
        ("is_review_later", data.is_review_later),
        ("reviewed_at", data.reviewed_at),
    ]:
        if value is not UNSET:
            field_values[field] = value

    is_edit_mode = bool(data.id)
    if is_edit_mode:
        post_review = await Post.objects.select_related("parent").aget(id=data.id, author=author)
        for field, value in field_values.items():
            setattr(post_review, field, value)
        await post_review.asave()

        post = post_review.parent
        assert post
    else:
        assert data.parent
        post = await Post.objects.aget(id=data.parent.id)
        post_review = await Post.objects.acreate(
            parent=post,
            author=author,
            type=Post.Type.Review,
            **field_values,
        )

    await _create_review_tags_and_update_post_tags(
        data=data, post=post, post_review=post_review, author=author
    )

    if data.alternatives:
        await PostRelated.objects.abulk_create(
            [
                PostRelated(post=post, author=author, **alternative_input)
                for alternative_input in data.alternatives
            ]
        )

    return post_review


async def _create_review_tags_and_update_post_tags(
    data: PostTypeInput, post: Post, post_review: Post, author: User
):
    if not data.tags:
        return

    post_review_tags = []
    for tag_input in data.tags:
        tag = await create_tag(
            name_raw=tag_input.name,
            post=post,
            author=author,
            is_vote_positive=_prase_field(tag_input.is_vote_positive),
            is_important=_prase_field(tag_input.is_important),
            comment=tag_input.comment if tag_input.comment else "",
        )
        post_review_tags.append(tag)
    await post_review.tags.aset(post_review_tags)

    # ensure parent.tags ⊇ post_review.tags
    post_tags = [tag async for tag in post.tags.all()]
    post_tags.extend(post_review_tags)
    await post.tags.aset(post_tags)


def _prase_field[T](field: T | None | UNSET) -> T | None:
    return field if field is not UNSET else None
