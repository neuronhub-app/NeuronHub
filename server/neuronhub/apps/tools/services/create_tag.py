import logging

from asgiref.sync import sync_to_async

from neuronhub.apps.tools.models import Tool
from neuronhub.apps.tools.models import ToolTag
from neuronhub.apps.tools.models import ToolTagVote
from neuronhub.apps.users.models import User


logger = logging.getLogger(__name__)


async def create_tag(
    name_raw: str,
    tool: Tool,
    author: User = None,
    is_vote_positive: bool = None,
    is_important: bool = False,
) -> ToolTag | None:
    tag = None

    if "/" in name_raw:
        names = name_raw.split("/")

        for tag_index, tag_name_raw in enumerate(names):
            tag_name = tag_name_raw.strip()
            if tag_parent_name_raw := names[tag_index - 1] if tag_index > 0 else None:
                tag_parent, _ = await ToolTag.objects.aget_or_create(
                    name=tag_parent_name_raw.strip(),
                    tool=tool,
                    defaults={
                        "author": author,
                    },
                )

                tag, _ = await ToolTag.objects.aget_or_create(
                    name=tag_name,
                    tool=tool,
                    tag_parent=tag_parent,
                    defaults={
                        "author": author,
                        "is_important": is_important,
                    },
                )
    else:
        tag, _ = await ToolTag.objects.aget_or_create(
            name=name_raw.strip(),
            tool=tool,
            defaults={
                "author": author,
                "is_important": is_important,
            },
        )

    if is_vote_positive is not None:
        if not tool:
            raise ValueError("Tool must be provided if is_vote_positive is set")

        await ToolTagVote.objects.aget_or_create(
            tool=tool,
            tag=tag,
            author=author,
            defaults={
                "is_vote_positive": is_vote_positive,
            },
        )

    await sync_to_async(tool.tags.add)(tag)

    return tag
