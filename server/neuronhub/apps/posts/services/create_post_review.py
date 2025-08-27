"""
#AI

Prob most of this file is redundant, ie Strawberry + BasePermission can be ~enough.

But `tags` are different - `/` must be parsed on backend/frontend.
"""

from __future__ import annotations

import typing
from django.core.exceptions import ValidationError
from strawberry import UNSET
from typing import Any

from neuronhub.apps.posts.models import PostTag, PostTagVote, Post, PostRelated
from neuronhub.apps.users.models import User

if typing.TYPE_CHECKING:
    from neuronhub.apps.posts.graphql.types import PostTypeInput, PostTagTypeInput


async def create_post_review(author: User, data: PostTypeInput) -> Post:
    if not data.parent:
        raise ValidationError("Tool is required")

    fields_updated = {}
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
            fields_updated[field] = value

    tool = await Post.objects.aget(id=data.parent.id)
    review, _ = await Post.objects.aupdate_or_create(
        parent=tool,
        author=author,
        type=Post.Type.Review,
        defaults=fields_updated,
    )

    if data.tags:
        tags = await _get_or_create_tags_and_votes(data.tags, tool, author=author)
        await review.tags.aset([tag.id for tag in tags])

    if data.alternatives:
        await PostRelated.objects.abulk_create(
            [
                PostRelated(post=tool, author=author, **alternative_input)
                for alternative_input in data.alternatives
            ]
        )

    return review


async def _get_or_create_tags_and_votes(
    tags_input: list[PostTagTypeInput], tool: Post, author: User
) -> list[PostTag]:
    tags = []

    for tag_input in tags_input:
        if tag_input.id:
            tag = await PostTag.objects.aget(id=tag_input.id)
            is_created = False
        else:
            tag, is_created = await _create_tag(tag_input.name, author)

        tags.append(tag)

        if is_created and tag_input.is_important is not UNSET:
            tag.is_important = tag_input.is_important
            await tag.asave(update_fields=["is_important"])

        await _update_or_create_votes(tag=tag, tool=tool, author=author, tag_input=tag_input)

    return tags


async def _create_tag(tag_name: str, author: User) -> tuple[PostTag, bool]:
    if " / " in tag_name:
        parent_name = tag_name.split(" / ")[0]
        child_name = tag_name.split(" / ")[-1]  # Get last part for multi-level

        parent_tag, _ = await PostTag.objects.aget_or_create(
            name=parent_name, defaults={"author": author}
        )
        tag, is_created = await PostTag.objects.aget_or_create(
            name=child_name, tag_parent=parent_tag, defaults={"author": author}
        )
    else:
        tag, is_created = await PostTag.objects.aget_or_create(
            name=tag_name, defaults={"author": author}
        )

    return tag, is_created


async def _update_or_create_votes(
    tag: PostTag, tool: Post, author: User, tag_input: PostTagTypeInput
):
    defaults: dict[str, Any] = {}
    if tag_input.is_vote_positive is not UNSET:
        defaults["is_vote_positive"] = tag_input.is_vote_positive
    if tag_input.comment is not UNSET:
        defaults["comment"] = tag_input.comment or ""

    if defaults:
        await PostTagVote.objects.aupdate_or_create(
            post=tool,
            tag=tag,
            author=author,
            defaults=defaults,
        )
