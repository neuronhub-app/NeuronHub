import logging
from dataclasses import dataclass

from neuronhub.apps.tools.models import Tool
from neuronhub.apps.tools.models import ToolTag
from neuronhub.apps.tools.models import ToolTagVote
from neuronhub.apps.users.models import User


logger = logging.getLogger(__name__)


@dataclass
class Vote:
    is_pos: bool
    tool: Tool
    author: User | None = None


async def create_tag(
    name_raw: str,
    author: User = None,
    vote: Vote = None,
) -> ToolTag | None:
    tag = None

    if "/" in name_raw:
        names = name_raw.split("/")

        for tag_index, tag_name_raw in enumerate(names):
            tag_name = tag_name_raw.strip()
            if tag_parent_name_raw := names[tag_index - 1] if tag_index > 0 else None:
                tag_parent, _ = await ToolTag.objects.aget_or_create(
                    name=tag_parent_name_raw.strip(),
                    defaults={
                        "author": author,
                    },
                )

                tag, _ = await ToolTag.objects.aget_or_create(
                    name=tag_name,
                    tag_parent=tag_parent,
                    defaults={
                        "author": author,
                    },
                )
    else:
        tag, _ = await ToolTag.objects.aget_or_create(
            name=name_raw.strip(),
            defaults={
                "author": author,
            },
        )

    if not tag:
        logger.warning(f"Failed to create '{name_raw}' tag")
        return tag

    if vote:
        if not author and not vote.author:
            logger.warning(f"Failed to create a vote due to a missing author for '{name_raw}'")
            return tag

        await ToolTagVote.objects.aget_or_create(
            tag=tag,
            author=author or vote.author,
            tool=vote.tool,
            defaults={
                "is_vote_positive": vote.is_pos,
            },
        )

    return tag
