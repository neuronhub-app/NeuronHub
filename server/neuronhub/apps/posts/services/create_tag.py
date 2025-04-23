import logging

from asgiref.sync import sync_to_async

from neuronhub.apps.posts.models import Post
from neuronhub.apps.posts.models import PostTag
from neuronhub.apps.posts.models import PostTagVote
from neuronhub.apps.users.models import User


logger = logging.getLogger(__name__)


async def create_tag(
    name_raw: str,
    post: Post,
    author: User = None,
    is_vote_positive: bool = None,
    is_important: bool = False,
) -> PostTag | None:
    if "/" in name_raw:
        tag: PostTag | None = None
        names = name_raw.split("/")

        for tag_index, tag_name_raw in enumerate(names):
            tag_name = tag_name_raw.strip()
            if tag_parent_name_raw := names[tag_index - 1] if tag_index > 0 else None:
                tag_parent, _ = await PostTag.objects.aget_or_create(
                    name=tag_parent_name_raw.strip(),
                    defaults={"author": author},
                )
                tag, _ = await PostTag.objects.aget_or_create(
                    name=tag_name,
                    tag_parent=tag_parent,
                    defaults={"author": author},
                )
                await sync_to_async(post.tags.add)(tag)
    else:
        tag, _ = await PostTag.objects.aget_or_create(
            name=name_raw.strip(),
            defaults={"author": author},
        )
        await sync_to_async(post.tags.add)(tag)

    if (is_vote_positive is not None) or (is_important is not None):
        if not post:
            raise ValueError("Tool must be provided if is_vote_positive is set")

        await PostTagVote.objects.aget_or_create(
            post=post,
            tag=tag,
            author=author,
            defaults={
                "is_vote_positive": is_vote_positive,
                "is_important": is_important,
            },
        )

    await sync_to_async(post.tags.add)(tag)

    return tag
