from __future__ import annotations

import typing

from neuronhub.apps.tools.graphql.mutations import ToolTagTypeInput
from neuronhub.apps.tools.models import Tool
from neuronhub.apps.tools.models import ToolReview
from neuronhub.apps.tools.models import ToolTag
from neuronhub.apps.tools.models import ToolTagVote
from neuronhub.apps.users.models import User


if typing.TYPE_CHECKING:
    from neuronhub.apps.tools.graphql.mutations import ToolReviewTypeInput


async def create_review(author: User, data: ToolReviewTypeInput) -> ToolReview:
    """
    validate
    - visible_to_* connection
    - recommended_to_* connection

    set
    - author
    """
    tool, _ = await Tool.objects.aget_or_create(
        name=data.tool.name,
        description=data.tool.description,
        github_url=data.tool.github_url,
        domain=data.tool.domain,
    )
    review = await ToolReview.objects.acreate(
        tool=tool,
        user=author,
        rating=data.rating,
        title=data.title,
        content=data.content,
        is_private=data.is_private or False,
    )

    tags_created = await _create_or_attach_tags(tool, author, tags_data=data.tags)

    tag_votes = await _create_tag_votes(
        review,
        author=author,
        tags=[*tags_created, *[tag for tag in data.tags if tag.id]],
        tags_data=data.tags,
    )

    review.tags.add([tag_vote.tag_id for tag_vote in tag_votes])


async def _create_or_attach_tags(
    tool: Tool,
    author: User,
    tags_data: list[ToolTagTypeInput],
):
    tags_to_create = []
    tags_new = [tag for tag in tags_data if tag.id is None]
    for tag_new in tags_new:
        tags_to_create.append(
            ToolTag(
                name=tag_new.name,
                description=tag_new.description,
                author=author,
            )
        )
    tags_created = await ToolTag.objects.abulk_create(tags_to_create)

    tool.tags.add(
        [
            tag.id
            for tag in [
                *tags_created,
                *[tag for tag in tags_data if tag.id],
            ]
        ]
    )


async def _create_tag_votes(
    review: ToolReview,
    author: User,
    tags: list[ToolTag | ToolTagTypeInput],
    tags_data: list[ToolTagTypeInput],
) -> list[ToolTagVote]:
    tag_votes = []
    for tag in tags:
        tag_comment = next(
            (tag_data.comment for tag_data in tags_data if tag_data.id == tag.id), None
        )
        is_vote_positive = next(
            (tag_data.is_vote_positive for tag_data in tags_data if tag_data.id == tag.id),
            None,
        )
        tag_vote, _ = await ToolTagVote.objects.aupdate_or_create(
            review=review,
            tag=tag.id,
            user=author,
            defaults=dict(
                comment=tag_comment,
                is_vote_positive=is_vote_positive,
            ),
        )
        tag_votes.append(tag_vote)
    return tag_votes
