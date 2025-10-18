from __future__ import annotations

import asyncio
from datetime import datetime
from enum import Enum
from typing import NotRequired, TypedDict, cast


from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.importer.models import ImportDomain, PostSource, UserSource
from neuronhub.apps.importer.services.request_json import request_json
from neuronhub.apps.posts.models import Post


class Config:
    class Api:
        algolia = "https://hn.algolia.com/api/v1"
        firebase = "https://hacker-news.firebaseio.com/v0"


class PostCategoryHN(Enum):
    Best = "best"
    Top = "top"
    Show = "show"
    Ask = "ask"
    Job = "job"


async def import_posts(category: PostCategoryHN = PostCategoryHN.Top) -> list[Post]:
    post_ids: list[ID] = await request_json(
        f"{Config.Api.firebase}/{category.value}stories.json"
    )
    posts_imported = await asyncio.gather(*[import_post(post_id) for post_id in post_ids])
    return posts_imported


async def import_post(post_id_external: ID) -> Post:
    post_json = await request_json(f"{Config.Api.algolia}/items/{post_id_external}")
    return await _import_post_json(post_json)


class PostAlgolia(TypedDict):
    id: ID
    author: Username
    title: str
    text: str | None
    url: str
    points: int
    created_at: DateISO
    children: list[CommentAlgolia]


class CommentAlgolia(TypedDict):
    id: ID
    author: Username
    text: str
    created_at: DateISO
    children: list[CommentAlgolia]


class PostFirebase(TypedDict):
    id: ID
    by: Username
    title: str
    kids: list[ID]
    url: str
    score: int
    time: int
    text: NotRequired[str]
    descendants: int


type ID = int | str
type Username = str
type DateISO = str


async def _import_post_json(post_json: PostAlgolia) -> Post:
    if author_name := post_json["author"]:
        await _user_source_get_or_create(author_name)

    post = await Post.objects.acreate(
        type=Post.Type.Post,
        title=post_json["title"],
        content_direct=post_json["text"] or "",
        source=_build_HN_item_url(post_json["id"]),
        source_author=author_name,
        visibility=Visibility.PUBLIC,
    )

    await PostSource.objects.acreate(
        post=post,
        domain=ImportDomain.HackerNews,
        id_external=post_json["id"],
        url_of_source=post_json["url"],
        score=post_json["points"],
        created_at_external=_parse_datetime(post_json["created_at"]),
        json=post_json,
    )

    for child in post_json["children"]:
        await _import_comment_json(comment_json=child, parent=post)

    return post


async def _import_comment_json(comment_json: CommentAlgolia, parent: Post) -> Post | None:
    post_comment, _ = await Post.objects.aupdate_or_create(
        type=Post.Type.Comment,
        parent=parent,
        source_data__id_external=comment_json["id"],
        defaults=dict(
            visibility=Visibility.PUBLIC,
            source_author=await _user_source_get_or_create(comment_json["author"]),
            content_direct=comment_json["text"],
        ),
    )
    await PostSource.objects.aupdate_or_create(
        post=post_comment,
        domain=ImportDomain.HackerNews,
        id_external=str(comment_json["id"]),
        created_at_external=_parse_datetime(comment_json["created_at"]),
        defaults=dict(
            json=_clean_HN_json(comment_json),
        ),
    )

    # todo use post_json_fb to infer `rank` of comments
    # do the query only if .children isn't empty
    # post_json_fb = await request_json(f"{Config.Api.firebase}/item/{comment_json['id']}.json")

    for child in comment_json["children"]:
        await _import_comment_json(comment_json=child, parent=post_comment)

    return post_comment


async def _user_source_get_or_create(username: str) -> Username:
    user, is_created = await UserSource.objects.aget_or_create(
        id_external=username,
        defaults={"username": username, "score": 0},
    )
    if is_created:
        # todo fetch karma and profile
        pass

    return user.username


def _parse_datetime(date_raw: DateISO) -> datetime | None:
    return datetime.fromisoformat(date_raw.replace("Z", "+00:00"))


def _build_HN_item_url(item_id: ID) -> str:
    return f"https://news.ycombinator.com/item?id={item_id}"


def _clean_HN_json(comment: CommentAlgolia) -> CommentAlgolia:
    fields_redundant = {"title", "story_id", "parent_id", "points", "url", "options", "type"}
    comment_clean = {key: val for key, val in comment.items() if key not in fields_redundant}

    if (children := comment_clean["children"]) and isinstance(children, list):
        comment_clean["children"] = [_clean_HN_json(child) for child in children]

    return cast(CommentAlgolia, comment_clean)


class CommentFirebase(TypedDict):
    id: ID
    by: Username
    parent: str
    kids: list[ID]
    time: int
