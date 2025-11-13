import asyncio
import logging
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Any, NotRequired, TypedDict, cast

from markdownify import markdownify


from neuronhub.apps.anonymizer.fields import Visibility
from neuronhub.apps.importer.models import ImportDomain, PostSource, UserSource
from neuronhub.apps.importer.services.import_html_meta import import_html_meta
from neuronhub.apps.importer.services.request_json import request_json
from neuronhub.apps.posts.models import Post, PostTypeEnum
from neuronhub.apps.posts.services.tag_create_or_update import tag_create_or_update

logger = logging.getLogger(__name__)


type ID = int
type Username = str
type DateISO = str
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
        time: int
        text: NotRequired[str]
        descendants: int

    class Comment(TypedDict):
        id: ID
        by: Username
        parent: ID
        kids: list[ID]
        time: int


class CategoryHackerNews(Enum):
    Best = "best"
    Top = "top"
    Show = "show"
    Ask = "ask"
    Job = "job"


@dataclass
class ImporterHackerNews:
    is_logs_enabled: bool = True
    is_use_cache: bool = False
    skip_comment_ranks: bool = False

    def __post_init__(self):
        self._api_algolia = "https://hn.algolia.com/api/v1"
        self._api_firebase = "https://hacker-news.firebaseio.com/v0"
        self._comments_total = 0
        self._comments_imported = 0

    async def import_posts(
        self,
        category: CategoryHackerNews = CategoryHackerNews.Top,
        posts_limit: int | None = None,
    ) -> list[Post]:
        post_ids: list[ID] = await self._request_json(
            f"{self._api_firebase}/{category.value}stories.json"
        )
        if posts_limit:
            post_ids = post_ids[:posts_limit]

        self._log_import(f"Importing {len(post_ids)} from {category.value}")

        post_jsons = await asyncio.gather(
            *[self._request_json(f"{self._api_algolia}/items/{post_id}") for post_id in post_ids]
        )
        posts_imported = await asyncio.gather(
            *[
                self._import_item(data=post_json, is_post=True, is_root=True)
                for post_json in post_jsons
            ]
        )

        self._log_import("Completed")
        return posts_imported

    async def import_post(self, id_ext: ID) -> Post:
        post_json = await self._request_json(f"{self._api_algolia}/items/{id_ext}")
        return await self._import_item(data=post_json, is_root=True, is_post=True)

    async def _import_item(
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

        self._log_progress(data["id"], Post.Type.Post if is_post else Post.Type.Comment)

        author_name = None
        if author := data.get("author"):
            author_name = await self._user_source_get_or_create(author)

        post_defaults = {
            "visibility": Visibility.PUBLIC,
            "source_author": author_name,
        }
        if is_post:
            post_data = cast(algolia.Post, data)
            post, _ = await Post.objects.aupdate_or_create(
                type=Post.Type.Post,
                post_source__id_external=data["id"],
                defaults=dict(
                    **post_defaults,
                    title=post_data["title"],
                    content_direct=markdownify(post_data.get("text") or ""),
                    source=self._build_HN_item_url(post_data["id"]),
                ),
            )
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
                    content_polite=markdownify(data["text"]),
                    parent_root=parent_root,
                ),
            )

        source = await self._source_update_or_create(
            post=post, data=data, is_post=is_post, rank=rank
        )

        if is_root:
            parent_root = post

            meta = await import_html_meta(url=source.url_of_source)
            post.content_polite = meta.content
            await post.asave()

        if comments := data.get("children"):
            if not self._comments_total:
                self._comments_total = self._count_total_comments_recursively(comments)
                self._comments_imported = 0

            # For top-level posts, compute all comment ranks recursively (unless skipped)
            if is_post and not self.skip_comment_ranks:
                comment_ranks = await self._derive_comment_ranks(data)
            # For nested comments, use the ranks passed from parent (or empty dict if skipped)
            else:
                comment_ranks = comment_ranks or {}

            await asyncio.gather(
                *[
                    self._import_item(
                        data=comment,
                        is_post=False,
                        parent=post,
                        parent_root=parent_root,
                        rank=comment_ranks.get(comment["id"])
                        if not self.skip_comment_ranks
                        else None,
                        comment_ranks=comment_ranks,  # Pass the full ranks dict to nested imports
                    )
                    for comment in comments
                ]
            )

        return post

    async def _source_update_or_create(
        self,
        post: Post,
        data: algolia.Post | algolia.Comment,
        is_post: bool,
        rank: int | None = None,
    ) -> PostSource:
        post_data: algolia.Post | algolia.Comment
        if is_post:
            post_data = cast(algolia.Post, data)
            defaults = {
                "json": post_data,
                "url_of_source": post_data.get("url", ""),
                "score": post_data.get("points", 0),
            }
        else:
            post_data = cast(algolia.Comment, data)
            defaults = {
                "json": self._clean_HN_json(post_data),
                "rank": rank,
            }
        post_source, _ = await PostSource.objects.aupdate_or_create(
            post=post,
            domain=ImportDomain.HackerNews,
            id_external=data["id"],
            defaults={
                **defaults,
                "created_at_external": datetime.fromisoformat(
                    post_data["created_at"].replace("Z", "+00:00")
                ),
            },
        )
        return post_source

    def _count_total_comments_recursively(self, comments: list[algolia.Comment]) -> int:
        count_total = len(comments)
        for comment in comments:
            if children := comment.get("children"):
                count_total += self._count_total_comments_recursively(children)
        return count_total

    async def _derive_comment_ranks(
        self, parent: algolia.Comment | algolia.Post
    ) -> dict[ID, Rank]:
        if not parent["children"]:
            return {}
        item_json: firebase.Post | firebase.Comment = await self._request_json(
            f"{self._api_firebase}/item/{parent['id']}.json"
        )
        comment_ids = item_json.get("kids", [])
        if not comment_ids:
            return {}

        return await self._derive_ranks_by_ids_recursively(comment_ids)

    async def _derive_ranks_by_ids_recursively(self, comment_ids: list[ID]) -> dict[ID, Rank]:
        comment_ranks: dict[ID, Rank] = {}

        for comment_id_position, comment_id in enumerate(comment_ids):
            comment_ranks[comment_id] = len(comment_ids) - comment_id_position

        children_ranks = await asyncio.gather(
            *[self._get_nested_comment_ranks(comment_id) for comment_id in comment_ids]
        )
        for child_ranks in children_ranks:
            comment_ranks.update(child_ranks)

        return comment_ranks

    async def _get_nested_comment_ranks(self, comment_id: ID) -> dict[ID, Rank]:
        item_json: firebase.Comment = await self._request_json(
            f"{self._api_firebase}/item/{comment_id}.json"
        )
        nested_comment_ids = item_json.get("kids", [])
        if not nested_comment_ids:
            return {}

        return await self._derive_ranks_by_ids_recursively(nested_comment_ids)

    def _log_progress(self, item_id: ID, post_type: PostTypeEnum):
        if not self.is_logs_enabled:
            return

        self._comments_imported += 1
        if self._comments_total > 0:
            percent = (self._comments_imported / self._comments_total) * 100
            logger.info(f"[{percent:5.1f}%] {post_type.name} #{item_id}")
        else:
            logger.info(f"[{self._comments_imported}] {post_type.name} #{item_id}")

    def _log_import(self, text: str):
        if self.is_logs_enabled:
            logger.info(f"Importing: {text}")

    async def _user_source_get_or_create(self, username: str) -> Username:
        user, is_created = await UserSource.objects.aget_or_create(
            id_external=username,
            defaults={"username": username, "score": 0},
        )
        if is_created:
            # todo prob: fetch karma and profile
            pass

        return user.username

    async def _request_json(self, url: str) -> Any:
        return await request_json(url, is_use_cache=self.is_use_cache)

    @staticmethod
    def _clean_HN_json(comment: algolia.Comment) -> algolia.Comment:
        fields_redundant = {"title", "story_id", "parent_id", "points", "url", "options", "type"}
        comment_clean = {key: val for key, val in comment.items() if key not in fields_redundant}

        if (children := comment_clean["children"]) and isinstance(children, list):
            comment_clean["children"] = [
                ImporterHackerNews._clean_HN_json(child) for child in children
            ]

        return cast(algolia.Comment, comment_clean)

    @staticmethod
    def _build_HN_item_url(item_id: ID) -> str:
        return f"https://news.ycombinator.com/item?id={item_id}"
