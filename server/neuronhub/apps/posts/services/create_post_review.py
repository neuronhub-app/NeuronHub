from __future__ import annotations

import typing

from django.core.exceptions import ValidationError

from neuronhub.apps.posts.graphql.types import PostTagTypeInput
from neuronhub.apps.posts.graphql.types import PostTypeInput
from neuronhub.apps.posts.models import PostTag
from neuronhub.apps.posts.models import PostTagVote
from neuronhub.apps.posts.models import Post
from neuronhub.apps.posts.models import PostRelated
from neuronhub.apps.users.models import User


if typing.TYPE_CHECKING:
    from neuronhub.apps.posts.graphql.types import PostTypeInput


async def create_post_review(author: User, data: PostTypeInput) -> Post:
    tool = await _create_or_update_tool(data.parent, author)

    post_review, _ = await Post.objects.aget_or_update(
        parent=tool,
        author=author,
        defaults=dict(
            title=data.title,
            source=data.source,
            content=data.content,
            content_private=data.content_private,
            visibility=data.visibility,
            # review fields
            review_rating=data.review_rating,
            review_usage_status=data.review_usage_status,
            review_importance=data.review_importance,
            reviewed_at=data.reviewed_at,
            is_review_later=data.is_review_later,
        ),
    )

    if data.tags:
        tags = await _create_or_add_tags(tool, author, tags_input=data.tags)
        post_review.tags.add([tag.id for tag in tags])

    return post_review


async def _create_or_update_tool(
    tool_data: PostTypeInput,
    author: User,
):
    tool, _ = await Post.objects.aget_or_create(
        type=Post.Type.Tool,
        title=tool_data.title,
        domain=tool_data.domain,  # todo[UX-p5] validate unique on frontend
        defaults=dict(
            description=tool_data.content,
            github_url=tool_data.github_url,
            crunchbase_url=tool_data.crunchbase_url,
        ),
    )

    alternatives = []
    for alternative_dict in tool_data.alternatives or []:
        alternative = PostRelated(
            tool=tool,
            author=author,
            **alternative_dict,
        )
        alternatives.append(alternative)
    await PostRelated.objects.abulk_create(alternatives)
    return tool


async def _create_or_add_tags(
    tool: Post,
    author: User,
    tags_input: list[PostTagTypeInput],
):
    tags_to_create = []
    for tag_to_create in [tag for tag in tags_input if tag.id is None]:
        tag_parent = None
        tag_name = tag_to_create.name
        is_has_parent = " / " in tag_to_create.name
        if is_has_parent:
            tag_parent_name, tag_name = tag_to_create.name.split(" / ")
            tag_parent, _ = await PostTag.objects.aget_or_create(
                name=tag_parent_name,
                defaults=dict(
                    author=author,
                ),
            )
        tags_to_create.append(
            PostTag(
                tools=[tool],
                tag_parent=tag_parent,
                name=tag_name,
                comment=tag_to_create.comment,
                author=author,
            )
        )
    tags_created = await PostTag.objects.abulk_create(tags_to_create)
    tags_existing = [tag for tag in tags_input if tag.id]

    tool.tags.add(
        [
            tag.id
            for tag in [
                *tags_created,
                *[tag.id for tag in tags_existing],
            ]
        ]
    )

    for tag in tags_input:
        is_tag_vote_needed = tag.is_vote_positive or tag.is_important
        if is_tag_vote_needed:
            await PostTagVote.objects.aupdate_or_create(
                tool=tool,
                tag=tag.id,
                author=author,
                defaults=dict(
                    comment=tag.comment,
                    is_vote_positive=tag.is_vote_positive,
                    is_important=tag.is_important,
                ),
            )

    return [*tags_created, *tags_existing]


async def _set_visibility_and_recommended(
    review: Post,
    data: PostTypeInput,
):
    user_connection_groups = review.author.connection_groups.all().prefetch_related(
        "connections"
    )
    user_connections = [
        connection for group in user_connection_groups for connection in group.connections.all()
    ]

    for connection_input in [
        *data.visible_to_users,
        *data.recommended_to_users,
    ]:
        if connection_input not in user_connections:
            raise ValidationError(f"Connection not found: {connection_input}")

    for connection_group_input in [
        *data.visible_to_groups,
        *data.recommended_to_groups,
    ]:
        if connection_group_input not in user_connection_groups:
            raise ValidationError(f"Connection group not found: {connection_group_input}")

    await review.visible_to_users.set([user.id for user in data.visible_to_users])
    await review.visible_to_groups.set([group.id for group in data.visible_to_groups])

    await review.recommended_to_users.set([user.id for user in data.recommended_to_users])
    await review.recommended_to_groups.set([group.id for group in data.recommended_to_groups])

    return review
