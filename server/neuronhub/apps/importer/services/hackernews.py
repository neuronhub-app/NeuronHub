import asyncio
import logging
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Any
from typing import NotRequired
from typing import TypedDict
from typing import cast
from zoneinfo import ZoneInfo

import strawberry
from django.conf import settings
from markdownify import markdownify

from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.importer.models import ImportDomain
from neuronhub.apps.importer.models import PostSource
from neuronhub.apps.importer.models import UserSource
from neuronhub.apps.importer.services.import_html_meta import import_html_meta
from neuronhub.apps.importer.services.request_json import request_json
from neuronhub.apps.posts.models import Post
from neuronhub.apps.posts.models import PostTypeEnum
from neuronhub.apps.posts.services.tag_create_or_update import tag_create_or_update


logger = logging.getLogger(__name__)

type ID = int
type Username = str
type DateISO = str
type DateUnix = int
type Rank = int


class algolia:
    class Post(TypedDict):
        id: ID
        author: Username
        title: str
        text: str | None
        url: str
        points: int
        created_at: DateISO
        children: list[algolia.Comment]

    class Comment(TypedDict):
        id: ID
        author: Username
        text: str
        created_at: DateISO
        children: list[algolia.Comment]


class firebase:
    class Post(TypedDict):
        id: ID
        by: Username
        title: str
        kids: list[ID]
        url: str
        score: int
        time: DateUnix
        text: NotRequired[str]
        descendants: int

    class User(TypedDict):
        id: Username
        created: DateUnix
        submitted: list[ID]
        karma: int
        about: str | None

    class Comment(TypedDict):
        id: ID
        by: Username
        parent: ID
        kids: list[ID]
        time: int


@strawberry.enum
class CategoryHackerNews(Enum):
    Best = "best"
    Top = "top"
    Show = "show"
    Ask = "ask"
    Job = "job"


@dataclass
class ImporterHackerNews:
    """
    Workflow:
    1. gets `post_ids` from Firebase API
    2. gets JSON from Algolia API by `post_ids`
    3. saves to db with [[ImporterHackerNews#_update_or_create_post]]
    4. ranks Comments with [[ImporterHackerNews#_derive_comment_ranks_from_API_order_recursively]]
       by querying Firebase API recursively for each thread level
    """

    is_derive_comment_ranks_recursively_from_API: bool = True
    is_use_cache: bool = False
    is_logging_enabled: bool = True

    class _api:
        algolia = "https://hn.algolia.com/api/v1"
        firebase = "https://hacker-news.firebaseio.com/v0"

    class _cache_for_days:
        user = 15

    def __post_init__(self):
        self._comments_total = 0
        self._comments_imported = 0
        self._comment_threads_ranked = 0

    async def import_posts(
        self,
        category: CategoryHackerNews = CategoryHackerNews.Top,
        limit: int | None = None,
    ) -> list[Post | BaseException]:
        post_ids: list[ID] = await self._request(
            f"{self._api.firebase}/{category.value}stories.json"
        )
        if limit:
            post_ids = post_ids[:limit]

        self._log_import(
            f"{len(post_ids)} from {category.value}, cache={self.is_use_cache}, comment_ranks={self.is_derive_comment_ranks_recursively_from_API}"
        )

        post_jsons = await asyncio.gather(
            *[self._request(f"{self._api.algolia}/items/{post_id}") for post_id in post_ids]
        )
        posts_imported = await asyncio.gather(
            *[
                self._update_or_create_post(
                    data=post_json,
                    is_post=True,
                    is_root=True,
                    rank=len(post_jsons) - position,
                )
                for position, post_json in enumerate(post_jsons)
            ],
            return_exceptions=True,
        )
        self._log_import("Completed")

        return posts_imported

    async def import_post(self, id_ext: ID) -> Post:
        post_json = await self._request(f"{self._api.algolia}/items/{id_ext}")
        return await self._update_or_create_post(data=post_json, is_root=True, is_post=True)

    async def _update_or_create_post(
        self,
        *,
        data: algolia.Post | algolia.Comment,
        is_post: bool,
        parent: Post | None = None,
        parent_root: Post | None = None,
        is_root: bool = False,
        rank: int | None = None,
        comment_ranks: dict[ID, Rank] | None = None,
    ) -> Post:
        from neuronhub.apps.tests.services.db_stubs_repopulate import tags

        self._log_progress(
            data["id"],
            post_type=Post.Type.Post if is_post else Post.Type.Comment,
        )

        user_source = await self._get_or_create_user_source(username=data["author"])
        author_name = user_source.username

        created_at_external = datetime.fromisoformat(
            data["created_at"].replace("Z", "+00:00")  # todo fix: #AI, prob wrong
        )

        post_defaults = {
            "visibility": Visibility.PUBLIC,
            "source_author": author_name,  # todo refac: drop
            "created_at": created_at_external,
        }
        if is_post:
            post_data = cast(algolia.Post, data)
            post, is_created = await Post.objects.aupdate_or_create(
                type=Post.Type.Post,
                post_source__id_external=data["id"],
                defaults=dict(
                    **post_defaults,
                    title=post_data["title"],
                    content_polite=markdownify(post_data.get("text") or ""),
                    source=f"https://news.ycombinator.com/item?id={post_data['id']}",
                ),
            )
            if is_created:
                tag = await tag_create_or_update(tags.hacker_news, post=post, is_important=True)
                await post.tags.aadd(tag)
        else:  # type = comment
            assert parent
            post, _ = await Post.objects.aupdate_or_create(
                type=Post.Type.Comment,
                parent=parent,
                post_source__id_external=data["id"],
                defaults=dict(
                    **post_defaults,
                    content_polite=markdownify(data["text"] or ""),
                    parent_root=parent_root,
                ),
            )

        post_source = await self._update_or_create_post_source(
            post=post,
            data=data,
            is_post=is_post,
            rank=rank,
            user_source=user_source,
            created_at_external=created_at_external,
        )

        if is_root:
            parent_root = post

            html_meta = await import_html_meta(url=post_source.url_of_source)
            post.content_polite = html_meta.content
            await post.asave()

        if comments := data.get("children"):
            is_can_collect_comments_from_post_root = is_post

            if is_can_collect_comments_from_post_root:
                self._comments_total = self._count_total_comments_recursively(comments)

            if (
                is_can_collect_comments_from_post_root
                and self.is_derive_comment_ranks_recursively_from_API
            ):
                comment_ranks = await self._derive_comment_ranks_from_API_order_recursively(data)
            else:
                comment_ranks = comment_ranks or {}

            await asyncio.gather(
                *[
                    self._update_or_create_post(
                        data=comment,
                        is_post=False,
                        parent=post,
                        parent_root=parent_root,
                        comment_ranks=comment_ranks,
                        rank=comment_ranks.get(comment["id"]),
                    )
                    for comment in comments
                ]
            )

        return post

    async def _update_or_create_post_source(
        self,
        post: Post,
        data: algolia.Post | algolia.Comment,
        is_post: bool,
        rank: int | None = None,
        user_source: UserSource | None = None,
        created_at_external: datetime | None = None,
    ) -> PostSource:
        post_data: algolia.Post | algolia.Comment
        if is_post:
            post_data = cast(algolia.Post, data)
            defaults = {
                "json": post_data,
                "url_of_source": post_data.get("url", ""),
                "score": post_data.get("points", 0),
                "rank": rank,
                "user_source": user_source,
            }
        else:
            post_data = cast(algolia.Comment, data)
            defaults = {
                "json": self._clean_HN_json_recursively(post_data),
                "rank": rank,
                "user_source": user_source,
            }
            if not self.is_derive_comment_ranks_recursively_from_API:
                del defaults["rank"]  # don't override current db

        post_source, _ = await PostSource.objects.aupdate_or_create(
            post=post,
            domain=ImportDomain.HackerNews,
            id_external=data["id"],
            defaults={
                **defaults,
                "created_at_external": created_at_external,
            },
        )
        return post_source

    def _count_total_comments_recursively(self, comments: list[algolia.Comment]) -> int:
        count_total = len(comments)
        for comment in comments:
            if children := comment.get("children"):
                count_total += self._count_total_comments_recursively(children)
        return count_total

    async def _derive_comment_ranks_from_API_order_recursively(
        self, parent: algolia.Comment | algolia.Post
    ) -> dict[ID, Rank]:
        if not parent["children"]:
            return {}
        item_json: firebase.Post | firebase.Comment = await self._request(
            f"{self._api.firebase}/item/{parent['id']}.json"
        )
        self._comment_threads_ranked += 1
        self._log_import(f"ranked thread #{self._comment_threads_ranked}")

        comment_ids = item_json.get("kids", [])
        if not comment_ids:
            return {}

        return await self._derive_ranks_by_ids_recursively(comment_ids)

    async def _derive_ranks_by_ids_recursively(self, comment_ids: list[ID]) -> dict[ID, Rank]:
        comment_ranks: dict[ID, Rank] = {}

        for comment_id_position, comment_id in enumerate(comment_ids):
            comment_ranks[comment_id] = len(comment_ids) - comment_id_position

        children_ranks = await asyncio.gather(
            *[self._query_nested_comment_ranks(comment_id) for comment_id in comment_ids]
        )
        for child_ranks in children_ranks:
            comment_ranks.update(child_ranks)

        return comment_ranks

    async def _query_nested_comment_ranks(self, comment_id: ID) -> dict[ID, Rank]:
        item_json: firebase.Comment = await self._request(
            f"{self._api.firebase}/item/{comment_id}.json"
        )
        nested_comment_ids = item_json.get("kids", [])
        if not nested_comment_ids:
            return {}

        return await self._derive_ranks_by_ids_recursively(nested_comment_ids)

    async def _get_or_create_user_source(self, username: str) -> UserSource:
        user, is_created = await UserSource.objects.aget_or_create(
            id_external=username,
            defaults={"username": username, "json": dict()},
        )
        if is_created:
            user_json: firebase.User = await self._request(
                f"{self._api.firebase}/user/{username}.json",
                cache_expiry_days=self._cache_for_days.user,
            )
            user.about = user_json.get("about") or ""
            user.score = user_json["karma"]
            user.created_at_external = datetime.fromtimestamp(
                user_json["created"], tz=ZoneInfo(settings.TIME_ZONE)
            )
            user.json = user_json
            await user.asave()

        return user

    async def _request(
        self,
        url: str,
        cache_expiry_days: int | None = None,
    ) -> Any:
        return await request_json(
            url,
            is_use_cache=self.is_use_cache,
            cache_expiry_days=cache_expiry_days,
        )

    @staticmethod
    def _clean_HN_json_recursively(comment: algolia.Comment) -> algolia.Comment:
        fields_redundant = {"title", "story_id", "parent_id", "points", "url", "options", "type"}
        comment_clean = {key: val for key, val in comment.items() if key not in fields_redundant}

        if (children := comment_clean["children"]) and isinstance(children, list):
            comment_clean["children"] = [
                ImporterHackerNews._clean_HN_json_recursively(child) for child in children
            ]

        return cast(algolia.Comment, comment_clean)

    def _log_progress(self, item_id: ID, post_type: PostTypeEnum):
        self._comments_imported += 1
        if self._comments_total > 0:
            percent = (self._comments_imported / self._comments_total) * 100
            self._log_import(f"[{percent:5.1f}%] {post_type.name} #{item_id}")
        else:
            self._log_import(f"[{self._comments_imported}] {post_type.name} #{item_id}")

    def _log_import(self, text: str):
        if self.is_logging_enabled:
            logger.info(f"Import: {text}")
