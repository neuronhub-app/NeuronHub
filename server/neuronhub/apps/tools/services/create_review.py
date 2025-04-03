from __future__ import annotations

import typing

from django.core.exceptions import ValidationError

from neuronhub.apps.tools.graphql.mutations import ToolTagTypeInput
from neuronhub.apps.tools.graphql.mutations import ToolTypeInput
from neuronhub.apps.tools.models import Tool
from neuronhub.apps.tools.models import ToolAlternative
from neuronhub.apps.tools.models import ToolReview
from neuronhub.apps.tools.models import ToolTag
from neuronhub.apps.tools.models import ToolTagVote
from neuronhub.apps.users.models import User


if typing.TYPE_CHECKING:
    from neuronhub.apps.tools.graphql.mutations import ToolReviewTypeInput


async def create_review(author: User, data: ToolReviewTypeInput) -> ToolReview:
    tool = await _create_or_update_tool(data.tool, author)

    review, _ = await ToolReview.objects.aupdate_or_create(
        tool=tool,
        author=author,
        id=data.id,
        defaults=dict(
            rating=data.rating,
            title=data.title,
            source=data.source,
            content=data.content,
            content_private=data.content_private,
            is_review_later=data.is_review_later or False,
            usage_status=data.usage_status,
            visibility=data.visibility,
            importance=data.importance,
            reviewed_at=data.reviewed_at,
        ),
    )

    if data.tags:
        tool_tags = await _create_or_add_tags(tool, author, tags_input=data.tags)
        review.tool_tags.add([tag.id for tag in tool_tags])

    return review


async def _create_or_update_tool(
    tool_data: ToolTypeInput,
    author: User,
):
    tool, _ = await Tool.objects.aget_or_create(
        name=tool_data.name,
        domain=tool_data.domain,  # todo[UX-p5] validate unique on frontend
        defaults=dict(
            description=tool_data.description,
            github_url=tool_data.github_url,
            crunchbase_url=tool_data.crunchbase_url,
        ),
    )

    alternatives = []
    for alternative_dict in tool_data.alternatives or []:
        alternative = ToolAlternative(
            tool=tool,
            author=author,
            **alternative_dict,
        )
        alternatives.append(alternative)
    await ToolAlternative.objects.abulk_create(alternatives)
    return tool


async def _create_or_add_tags(
    tool: Tool,
    author: User,
    tags_input: list[ToolTagTypeInput],
):
    tags_to_create = []
    for tag_to_create in [tag for tag in tags_input if tag.id is None]:
        tag_parent = None
        tag_name = tag_to_create.name
        is_has_parent = " / " in tag_to_create.name
        if is_has_parent:
            tag_parent_name, tag_name = tag_to_create.name.split(" / ")
            tag_parent, _ = await ToolTag.objects.aget_or_create(
                name=tag_parent_name,
                defaults=dict(
                    author=author,
                ),
            )
        tags_to_create.append(
            ToolTag(
                tools=[tool],
                tag_parent=tag_parent,
                name=tag_name,
                description=tag_to_create.description,
                author=author,
            )
        )
    tags_created = await ToolTag.objects.abulk_create(tags_to_create)
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
        is_tag_vote_needed = tag.is_vote_positive or tag.comment
        if is_tag_vote_needed:
            await ToolTagVote.objects.aupdate_or_create(
                tool=tool,
                tag=tag.id,
                author=author,
                defaults=dict(
                    comment=tag.comment,
                    is_vote_positive=tag.is_vote_positive,
                ),
            )

    return [*tags_created, *tags_existing]


async def _set_visibility_and_recommended(
    review: ToolReview,
    data: ToolReviewTypeInput,
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
