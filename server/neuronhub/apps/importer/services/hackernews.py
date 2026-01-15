import logging
from dataclasses import dataclass
from dataclasses import field
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
from neuronhub.apps.importer.services.hn_comment_ranks_deriver import CommentRanksDeriver
from neuronhub.apps.importer.services.hn_comment_ranks_deriver import asyncio_gather_batched
from neuronhub.apps.importer.services.import_html_meta import import_html_meta
from neuronhub.apps.importer.services.request_json import request_json
from neuronhub.apps.posts.models import Post
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
    3. saves to db with [[ImporterHackerNews#_update_or_create_post_or_comment]]
    4. ranks Comments with [[CommentRanksDeriver]] by querying Firebase API recursively

    # todo ? docs: mermaid for recursion
    """

    is_derive_comment_ranks_recursively_from_API: bool = True
    is_use_cache: bool = False
    is_logging_enabled: bool = True

    api_batch_size_algolia: int = 20
    api_batch_size_firebase: int = 5  # more sensitive
    api_batch_timeout_sec: float = 0.5
    # can have 500+ threads - need to limit recursion
    api_threads_ranking_limit: int = 120

    _comments_total: int = field(default=0, init=False)
    _comments_imported: int = field(default=0, init=False)

    class _api:
        algolia = "https://hn.algolia.com/api/v1"
        firebase = "https://hacker-news.firebaseio.com/v0"

    class _cache_for_days:
        user = 15

    async def import_posts(
        self,
        category: CategoryHackerNews = CategoryHackerNews.Top,
        limit: int | None = None,
    ) -> list[Post]:
        post_ids: list[ID] = await self._request(
            f"{self._api.firebase}/{category.value}stories.json"
        )
        if limit:
            post_ids = post_ids[:limit]

        self._log(
            f"{len(post_ids)} from {category.value}, cache={self.is_use_cache}, comment_ranks={self.is_derive_comment_ranks_recursively_from_API}"
        )

        post_jsons = await asyncio_gather_batched(
            [self._request(f"{self._api.algolia}/items/{post_id}") for post_id in post_ids],
            batch_size=self.api_batch_size_algolia,
            batch_timeout_sec=self.api_batch_timeout_sec,
        )
        posts_imported = await asyncio_gather_batched(
            [
                self._update_or_create_post_or_comment(
                    data=post_json,
                    is_parent_root_post=True,
                    rank=len(post_jsons) - position,
                )
                for position, post_json in enumerate(post_jsons)
            ],
            batch_size=self.api_batch_size_firebase,
            batch_timeout_sec=self.api_batch_timeout_sec,
        )
        self._log("Completed")

        return posts_imported

    async def import_post(self, id_ext: ID) -> Post:
        post_json = await self._request(f"{self._api.algolia}/items/{id_ext}")
        return await self._update_or_create_post_or_comment(
            data=post_json,
            is_parent_root_post=True,
        )

    # todo ? refac: split on Post and Comment functions
    async def _update_or_create_post_or_comment(
        self,
        *,
        data: algolia.Post | algolia.Comment,
        is_parent_root_post: bool,
        parent: Post | None = None,
        parent_root: Post | None = None,
        rank: Rank | None = None,
        comment_ranks: dict[ID, Rank] | None = None,
    ) -> Post:
        self._log_progress(data["id"], is_parent_root_post)

        # todo ? fix: #AI, prob wrong
        created_at_external = datetime.fromisoformat(data["created_at"].replace("Z", "+00:00"))

        if is_parent_root_post:
            post_data = cast(algolia.Post, data)
            post, is_created = await Post.objects.aupdate_or_create(
                type=Post.Type.Post,
                post_source__id_external=data["id"],
                defaults=dict(
                    visibility=Visibility.PUBLIC,
                    created_at=created_at_external,
                    title=post_data["title"],
                    # oddly, it converts into clean MD
                    content_polite=markdownify(post_data.get("text") or ""),
                    source=f"https://news.ycombinator.com/item?id={post_data['id']}",
                ),
            )
            parent_root = post
            if is_created:
                from neuronhub.apps.tests.services.db_stubs_repopulate import tags

                tag = await tag_create_or_update(tags.hacker_news, post=post, is_important=True)
                await post.tags.aadd(tag)

        else:  # data: algolia.Comment
            assert parent
            post, _ = await Post.objects.aupdate_or_create(
                type=Post.Type.Comment,
                parent=parent,
                post_source__id_external=data["id"],
                defaults=dict(
                    visibility=Visibility.PUBLIC,
                    created_at=created_at_external,
                    content_polite=markdownify(data["text"] or ""),
                    parent_root=parent_root,
                ),
            )

        user_source = await self._get_or_create_user_source_from_algolia(username=data["author"])
        await self._update_or_create_post_source(
            post=post,
            data=data,
            is_parent_root_post=is_parent_root_post,
            rank=rank,
            user_source=user_source,
            created_at_external=created_at_external,
        )

        if data["children"]:
            if is_parent_root_post:
                self._comments_total = self._count_total_comments_recursively(data["children"])

            comment_ranks = comment_ranks or {}

            if is_parent_root_post and self.is_derive_comment_ranks_recursively_from_API:
                parent_root = cast(Post, parent_root)
                try:
                    ranks_deriver = CommentRanksDeriver(importer=self, post_root=parent_root)
                    comment_ranks = await ranks_deriver.derive(data)
                except Exception as exc:
                    logger.exception(exc)

            await asyncio_gather_batched(
                [
                    self._update_or_create_post_or_comment(
                        data=comment,
                        is_parent_root_post=False,
                        parent=post,
                        parent_root=parent_root,
                        comment_ranks=comment_ranks,
                        rank=comment_ranks.get(comment["id"]),
                    )
                    for comment in data["children"]
                ],
                batch_size=self.api_batch_size_firebase,
                batch_timeout_sec=self.api_batch_timeout_sec,
            )

        return post

    async def _update_or_create_post_source(
        self,
        post: Post,
        data: algolia.Post | algolia.Comment,
        is_parent_root_post: bool,
        rank: int | None = None,
        user_source: UserSource | None = None,
        created_at_external: datetime | None = None,
    ) -> PostSource:
        if is_parent_root_post:
            data = cast(algolia.Post, data)
            defaults = {
                "json": data,
                "url_of_source": data.get("url", ""),
                "score": data.get("points", 0),
                "rank": rank,
                "user_source": user_source,
            }
        else:
            data = cast(algolia.Comment, data)
            defaults = {
                "json": self._clean_algolia_json_recursively(data),
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
        if is_parent_root_post and post_source.url_of_source:
            source_html_meta = await import_html_meta(url=post_source.url_of_source)
            post_source.source_html_meta = source_html_meta.content
            await post_source.asave()

        return post_source

    def _count_total_comments_recursively(self, comments: list[algolia.Comment]) -> int:
        count_total = len(comments)
        for comment in comments:
            if children := comment.get("children"):
                count_total += self._count_total_comments_recursively(children)
        return count_total

    async def _get_or_create_user_source_from_algolia(self, username: str) -> UserSource:
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

    def _clean_algolia_json_recursively(self, comment: algolia.Comment) -> algolia.Comment:
        fields_redundant = {"title", "story_id", "parent_id", "points", "url", "options", "type"}
        comment_clean = {key: val for key, val in comment.items() if key not in fields_redundant}

        if (children := comment_clean["children"]) and isinstance(children, list):
            comment_clean["children"] = [
                self._clean_algolia_json_recursively(child) for child in children
            ]

        return cast(algolia.Comment, comment_clean)

    def _log_progress(self, json_id: ID, is_parent_root_post: bool):
        self._comments_imported += 1
        post_type = Post.Type.Post if is_parent_root_post else Post.Type.Comment
        if self._comments_total > 0:
            percent = (self._comments_imported / self._comments_total) * 100
            self._log(f"[{percent:5.1f}%] {post_type.name} #{json_id}")
        else:
            self._log(f"[{self._comments_imported}] {post_type.name} #{json_id}")

    def _log(self, text: str):
        if self.is_logging_enabled:
            logger.info(f"Import: {text}")
