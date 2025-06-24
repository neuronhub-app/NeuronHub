from __future__ import annotations

import typing
from asgiref.sync import sync_to_async
from django.core.exceptions import ValidationError
from strawberry import UNSET
from typing import Any

from neuronhub.apps.posts.models import PostTag, PostTagVote, Post, PostRelated
from neuronhub.apps.users.models import User

if typing.TYPE_CHECKING:
    from neuronhub.apps.posts.graphql.types import PostTypeInput, PostTagTypeInput


async def create_post_review(author: User, data: PostTypeInput) -> Post:
    """Create a review for a tool with tags and votes."""
    if not data.parent:
        raise ValidationError("Parent tool is required for creating a review")

    review_defaults = {}
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
    ]:
        if value is not None and value != "" and value is not UNSET:
            review_defaults[field] = value

    review_lookup_dict = {}
    if data.reviewed_at is not UNSET:
        review_lookup_dict["reviewed_at"] = data.reviewed_at

    post_tool = await _get_or_create_post_tool(data.parent, author)
    review, _ = await Post.objects.aupdate_or_create(
        parent=post_tool,
        author=author,
        type=Post.Type.Review,
        **review_lookup_dict,
        defaults=review_defaults,
    )

    if data.tags:
        tags = await _process_tags(data.tags, post_tool, author=author)
        await sync_to_async(review.tags.set)([tag.id for tag in tags])

    return review


async def _get_or_create_post_tool(tool_input: PostTypeInput, author: User) -> Post:
    """Create or get existing tool, with alternatives."""
    tool, _ = await Post.objects.aget_or_create(
        type=Post.Type.Tool,
        title=tool_input.title,
        domain=tool_input.domain,
        defaults={
            "content": tool_input.content,
            "github_url": tool_input.github_url,
            "crunchbase_url": tool_input.crunchbase_url,
        },
    )

    if tool_input.alternatives:
        await PostRelated.objects.abulk_create(
            [
                PostRelated(post=tool, author=author, **alt_input)
                for alt_input in tool_input.alternatives
            ]
        )

    return tool


async def _process_tags(
    tags_input: list[PostTagTypeInput], tool: Post, author: User
) -> list[PostTag]:
    """Create tags, handle votes and importance."""
    tags_all = []

    for tag_input in tags_input:
        if tag_input.id:
            tag = await PostTag.objects.aget(id=tag_input.id)
        else:
            tag = await _create_tag(tag_input.name, author)

        tags_all.append(tag)

        if tag_input.is_important is not UNSET:
            tag.is_important = tag_input.is_important
            await tag.asave(update_fields=["is_important"])

        if (tag_input.is_vote_positive is not UNSET) or (tag_input.comment is not UNSET):
            await _tag_vote_update(tag, tool, author, tag_input)

    return tags_all


async def _create_tag(tag_name: str, author: User) -> PostTag:
    if " / " in tag_name:
        parent_name = tag_name.split(" / ")[0]
        child_name = tag_name.split(" / ")[-1]  # Get last part for multi-level

        parent_tag, _ = await PostTag.objects.aget_or_create(
            name=parent_name, defaults={"author": author}
        )
        tag, _ = await PostTag.objects.aget_or_create(
            name=child_name, tag_parent=parent_tag, defaults={"author": author}
        )
    else:
        tag, _ = await PostTag.objects.aget_or_create(name=tag_name, defaults={"author": author})

    return tag


async def _tag_vote_update(tag: PostTag, tool: Post, author: User, tag_input: PostTagTypeInput):
    """Update or create tag vote, preserving existing values when not specified."""
    defaults: dict[str, Any] = {}
    if tag_input.is_vote_positive is not UNSET:
        defaults["is_vote_positive"] = tag_input.is_vote_positive
    if tag_input.comment is not UNSET:
        defaults["comment"] = tag_input.comment if tag_input.comment is not None else ""

    if defaults:
        await PostTagVote.objects.aupdate_or_create(
            post=tool,
            tag=tag,
            author=author,
            defaults=defaults,
        )
