"""
Most of this file may be redundant, ie Strawberry + BasePermission can be ~enough.

But `tags` are different - the separator `/` must be parsed on backend/frontend.
"""

from django.db.models import Q
from strawberry import UNSET

from neuronhub.apps.posts.models import Post, PostRelated
from neuronhub.apps.posts.services.tag_create_or_update import tag_create_or_update
from neuronhub.apps.users.models import User
from neuronhub.apps.posts.graphql.types import PostTypeInput, PostTagTypeInput


async def post_update_or_create(author: User, data: PostTypeInput) -> Post:
    post = await _update_or_create(data, author)
    await _post_visibility_update(post, data)
    await _tags_update_or_create(post, data, author)
    return post


async def _update_or_create(data: PostTypeInput, author: User):
    data_parsed = _parse_data(data)
    is_edit_mode = bool(data.id)
    if is_edit_mode:
        is_allow_edit_imports = author.is_superuser
        if is_allow_edit_imports:
            post = await Post.objects.select_related("parent").aget(
                Q(author=author) | Q(author=None),
                id=data.id,
            )
        else:
            post = await Post.objects.select_related("parent").aget(
                author=author,
                id=data.id,
            )
        for field, value in data_parsed.items():
            setattr(post, field, value)
        await post.asave()
    else:
        # create Post
        is_parent_required = data.type in [Post.Type.Review, Post.Type.Comment]
        if is_parent_required:
            assert data.parent
            # todo refac: drop aget()? id is enough
            parent = await Post.objects.aget(id=data.parent.id)
            post = await Post.objects.acreate(parent=parent, author=author, **data_parsed)
            await _create_posts_related(parent, data, author)
        else:
            post = await Post.objects.acreate(author=author, **data_parsed)

    return post


def _parse_data(data: PostTypeInput) -> dict:
    field_values = {}
    # todo refac: iter over all → exclude .tags, .review_tags, etc
    for field_name, field_val in [
        ("type", data.type),
        # Type.Post
        ("category", data.category),
        ("title", data.title),
        ("source", data.source),
        ("source_author", data.source_author),
        ("content_polite", data.content_polite),
        ("content_direct", data.content_direct),
        ("content_rant", data.content_rant),
        ("content_private", data.content_private),
        ("image", data.image),
        ("visibility", data.visibility),
        # Type.Tool
        ("tool_type", data.tool_type),
        ("domain", data.domain),
        ("github_url", data.github_url),
        ("crunchbase_url", data.crunchbase_url),
        ("url", data.url),
        # Type.Review
        ("review_rating", data.review_rating),
        ("review_usage_status", data.review_usage_status),
        ("review_importance", data.review_importance),
        ("is_review_later", data.is_review_later),
        ("reviewed_at", data.reviewed_at),
    ]:
        if field_val is not UNSET:
            field_values[field_name] = field_val

    return field_values


async def _post_visibility_update(post: Post, data: PostTypeInput):
    if data.visible_to_users:
        await post.visible_to_users.aset(data.visible_to_users.set)
    if data.visible_to_groups:
        await post.visible_to_groups.aset(data.visible_to_groups.set)


async def _tags_update_or_create(
    post: Post,
    data: PostTypeInput,
    author: User,
):
    if data.tags:
        tags = [
            await _tag_create_or_update(tag_input, post=post, author=author)
            for tag_input in data.tags
        ]
        await post.tags.aset(tags)

        if data.type == Post.Type.Review:
            # ensure review.parent.tags ⊇ review.tags
            assert post.parent
            tool_tags = [tag async for tag in post.parent.tags.all()]
            tool_tags.extend(tags)
            await post.parent.tags.aset(tool_tags)

    if data.review_tags:
        review_tags = [
            await _tag_create_or_update(tag_input, post, author, is_review_tag=True)
            for tag_input in data.review_tags
        ]
        await post.review_tags.aset(review_tags)


async def _create_posts_related(parent: Post, data: PostTypeInput, author: User):
    if data.alternatives:
        # todo ! choose `parent` or `post` by `type`:
        # - Type.Review → .parent
        # - Type.Tool → post
        await PostRelated.objects.abulk_create(
            [
                PostRelated(post=parent, author=author, **alt_input)
                for alt_input in data.alternatives
            ]
        )


async def _tag_create_or_update(
    tag_input: PostTagTypeInput, post: Post, author: User, is_review_tag=False
):
    return await tag_create_or_update(
        name_raw=tag_input.name,
        post=post,
        author=author,
        is_vote_positive=tag_input.is_vote_positive,  # Pass UNSET/None/bool directly
        comment=tag_input.comment if tag_input.comment else "",
        is_review_tag=is_review_tag,
        is_important=tag_input.is_important if tag_input.is_important is not UNSET else None,
    )
