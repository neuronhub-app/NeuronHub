"""
#AI

Prob most of this file is redundant, ie Strawberry + BasePermission can be ~enough.

But `tags` are different - `/` must be parsed on backend/frontend.
"""

from __future__ import annotations

import typing

from strawberry import UNSET

from neuronhub.apps.posts.models import Post, PostRelated
from neuronhub.apps.posts.services.create_tag import create_tag
from neuronhub.apps.users.models import User

if typing.TYPE_CHECKING:
    from neuronhub.apps.posts.graphql.types import PostTypeInput


async def post_review_create_or_update(author: User, data: PostTypeInput) -> Post:
    field_values = {}
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
            field_values[field] = value

    is_edit_mode = bool(data.id)
    if is_edit_mode:
        review = await Post.objects.select_related("parent").aget(id=data.id, author=author)
        for field, value in field_values.items():
            setattr(review, field, value)
        await review.asave()

        tool = review.parent
        assert tool
    else:
        assert data.parent
        tool = await Post.objects.aget(id=data.parent.id)
        review, _ = await Post.objects.aupdate_or_create(
            parent=tool,
            author=author,
            type=Post.Type.Review,
            defaults=field_values,
        )

    if data.tags:
        for tag_input in data.tags:
            await create_tag(
                name_raw=tag_input.name,
                post=tool,
                author=author,
                is_vote_positive=_prase_field(tag_input.is_vote_positive),
                is_important=_prase_field(tag_input.is_important),
                comment=tag_input.comment if tag_input.comment else "",
            )

    if data.alternatives:
        await PostRelated.objects.abulk_create(
            [
                PostRelated(post=tool, author=author, **alternative_input)
                for alternative_input in data.alternatives
            ]
        )

    return review


def _prase_field[Val](field: Val | UNSET) -> Val | None:
    return field if field is not UNSET else None
