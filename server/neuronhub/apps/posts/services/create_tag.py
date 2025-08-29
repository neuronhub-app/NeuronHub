import logging

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
    is_important: bool = None,
    comment: str = "",
) -> PostTag | None:
    post_tag_defaults = dict(author=author, is_important=is_important)
    is_can_edit_importance = False

    if "/" in name_raw:
        tag: PostTag | None = None
        names = name_raw.split("/")

        for tag_index, tag_name_raw in enumerate(names):
            tag_name = tag_name_raw.strip()
            if tag_parent_name_raw := names[tag_index - 1] if tag_index > 0 else None:
                tag_parent, _ = await PostTag.objects.aget_or_create(
                    name=tag_parent_name_raw.strip(),
                    defaults=post_tag_defaults,
                )
                tag, is_created = await PostTag.objects.aget_or_create(
                    name=tag_name,
                    tag_parent=tag_parent,
                    defaults=post_tag_defaults,
                )
                is_can_edit_importance = is_created
                await post.tags.aadd(tag)
    else:
        tag, is_created = await PostTag.objects.aget_or_create(
            name=name_raw.strip(),
            defaults=post_tag_defaults,
        )
        is_can_edit_importance = is_created
        await post.tags.aadd(tag)

    if is_vote_positive is not None:
        assert post, "Voting needs a Post(type=Tool)"
        await PostTagVote.objects.aupdate_or_create(
            post=post,
            tag=tag,
            author=author,
            defaults={"is_vote_positive": is_vote_positive, "comment": comment},
        )

    assert tag, "If not - the for..in failed"

    if is_can_edit_importance and is_important is not None:
        tag.is_important = is_important
        await tag.asave()

    await post.tags.aadd(tag)
    return tag
