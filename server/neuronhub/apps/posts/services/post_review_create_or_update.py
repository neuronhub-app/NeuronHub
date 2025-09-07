"""
#AI

Prob most of this file is redundant, ie Strawberry + BasePermission can be ~enough.

But `tags` are different - the separator `/` must be parsed on backend/frontend.
"""

from __future__ import annotations

import typing

from strawberry import UNSET

from neuronhub.apps.posts.models import Post, PostRelated
from neuronhub.apps.posts.services.tag_create_or_update import tag_create_or_update
from neuronhub.apps.users.models import User

if typing.TYPE_CHECKING:
    from neuronhub.apps.posts.graphql.types import PostTypeInput, PostTagTypeInput


# todo refac-name: review_create_or_update
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
        review = await Post.objects.select_related("parent").aget(id=data.id, author=author)
        for field, value in field_values.items():
            setattr(review, field, value)
        await review.asave()

        tool = review.parent
        assert tool
    else:
        assert data.parent
        tool = await Post.objects.aget(id=data.parent.id)
        review = await Post.objects.acreate(
            parent=tool,
            author=author,
            type=Post.Type.Review,
            **field_values,
        )

    await _tags_create_or_update(data=data, tool=tool, review=review, author=author)

    if data.alternatives:
        await PostRelated.objects.abulk_create(
            [
                PostRelated(post=tool, author=author, **alternative_input)
                for alternative_input in data.alternatives
            ]
        )

    return review


async def _tags_create_or_update(data: PostTypeInput, tool: Post, review: Post, author: User):
    if data.tags:
        tags = [
            await _tag_create_or_update(tag_input, post=review, author=author)
            for tag_input in data.tags
        ]
        await review.tags.aset(tags)

        # ensure review.parent.tags ⊇ review.tags
        tool_tags = [tag async for tag in tool.tags.all()]
        tool_tags.extend(tags)
        await tool.tags.aset(tool_tags)

    if data.review_tags:
        review_tags = [
            await _tag_create_or_update(tag_input, review, author, is_review_tag=True)
            for tag_input in data.review_tags
        ]
        await review.review_tags.aset(review_tags)


async def _tag_create_or_update(
    tag_input: PostTagTypeInput, post: Post, author: User, is_review_tag=False
):
    return await tag_create_or_update(
        name_raw=tag_input.name,
        post=post,
        author=author,
        is_vote_positive=tag_input.is_vote_positive,  # Pass UNSET/None/bool directly
        comment=tag_input.comment if tag_input.comment else "",
        is_review_tag=is_review_tag,
        is_important=tag_input.is_important if tag_input.is_important is not UNSET else None,
    )
