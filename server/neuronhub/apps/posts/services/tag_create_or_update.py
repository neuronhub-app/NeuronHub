import logging
from dataclasses import dataclass
from collections.abc import Iterator

from strawberry import UNSET
from strawberry.types.unset import UnsetType

from neuronhub.apps.posts.models import Post
from neuronhub.apps.posts.models import PostTag
from neuronhub.apps.posts.models import PostTagVote
from neuronhub.apps.users.models import User


logger = logging.getLogger(__name__)


async def tag_create_or_update(
    name_raw: str,
    post: Post,
    author: User = None,
    is_vote_positive: bool | None | UnsetType = UNSET,
    is_important: bool = None,
    comment: str = "",
    is_review_tag: bool = False,
) -> PostTag:
    tag = await _tag_crate_or_update(
        name_raw, author, is_important=is_important, is_review_tag=is_review_tag
    )
    if author:
        await _vote_update_or_remove(post, tag, author, is_vote_positive, comment)

    return tag


async def _tag_crate_or_update(
    name_raw: str,
    author: User | None,
    is_important: bool | None,
    is_review_tag: bool,
) -> PostTag:
    tag: PostTag | None = None
    for parsed in _parse_tag_name_raw(name_raw):
        tag_parent = None
        defaults = dict(author=author, is_important=is_important, is_review_tag=is_review_tag)
        if parsed.tag_parent_name:
            tag_parent, _ = await PostTag.objects.aget_or_create(
                name=parsed.tag_parent_name,
                defaults=defaults,
            )
        tag, _ = await PostTag.objects.aget_or_create(
            name=parsed.tag_name,
            tag_parent=tag_parent,
            defaults=defaults,
        )
    assert tag, "name parsing must work"
    return tag


async def _vote_update_or_remove(
    post: Post,
    tag: PostTag,
    author: User,
    is_vote_positive: bool | None | UnsetType,
    comment: str,
):
    if is_db_record_redundant := (is_vote_positive is None) and (not comment):
        await PostTagVote.objects.filter(post=post, tag=tag, author=author).adelete()
        return

    fields_updated = {"is_vote_positive": is_vote_positive, "comment": comment}

    if is_skip_vote_update := is_vote_positive is UNSET:
        del fields_updated["is_vote_positive"]

    await PostTagVote.objects.aupdate_or_create(
        post=post,
        tag=tag,
        author=author,
        defaults=fields_updated,
    )


@dataclass
class ParseResult:
    tag_name: str
    tag_parent_name: str | None = None


def _parse_tag_name_raw(tag_name_raw: str) -> Iterator[ParseResult]:
    if names_raw := tag_name_raw.split("/"):
        for name_index, name_raw in enumerate(names_raw):
            is_has_parent = name_index > 0
            if is_has_parent:
                parent_name = names_raw[name_index - 1]
                yield ParseResult(tag_parent_name=parent_name.strip(), tag_name=name_raw.strip())
            else:
                yield ParseResult(tag_name=name_raw.strip())
    else:
        yield ParseResult(tag_name=tag_name_raw.strip())
