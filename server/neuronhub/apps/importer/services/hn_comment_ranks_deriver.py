import asyncio
import logging
from asyncio import sleep
from collections.abc import Awaitable
from dataclasses import dataclass
from dataclasses import field
from itertools import batched
from typing import TYPE_CHECKING

from neuronhub.apps.posts.models import Post


if TYPE_CHECKING:
    from neuronhub.apps.importer.services.hackernews import ID
    from neuronhub.apps.importer.services.hackernews import ImporterHackerNews
    from neuronhub.apps.importer.services.hackernews import Rank
    from neuronhub.apps.importer.services.hackernews import algolia
    from neuronhub.apps.importer.services.hackernews import firebase


logger = logging.getLogger(__name__)


async def asyncio_gather_batched[T](
    awaitables: list[Awaitable[T]],
    batch_size: int = 5,
    batch_timeout_sec: float = 0.5,
) -> list[T]:
    """
    Officially there's no API limit, but HN throttles at 2+/sec.
    """
    results: list[T] = []
    for batch in batched(awaitables, batch_size):
        results.extend(await asyncio.gather(*batch))
        await sleep(batch_timeout_sec)
    return results


@dataclass
class CommentRanksDeriver:
    """
    Derives Comment ranks from Firebase API .kids[] ordering for a single root Post.
    """

    post_root: Post
    importer: ImporterHackerNews

    _ranking_limit_count: int = field(default=0, init=False)

    async def derive(self, parent: algolia.Post | algolia.Comment) -> dict[ID, Rank]:
        """
        todo ! refac: check if algolia.Comment has children, as it has the full tree - mb no point in HTTP queries
        """

        if not parent["children"]:
            return {}

        item_json: firebase.Post | firebase.Comment = await self.importer._request(
            f"{self.importer._api.firebase}/item/{parent['id']}.json"
        )
        self._ranking_limit_count += 1
        self._log(f"ranked #{self._ranking_limit_count}")

        comment_ids = item_json.get("kids", [])
        if not comment_ids:
            return {}

        return await self._derive_ranks_recursively(comment_ids)

    async def _derive_ranks_recursively(self, comment_ids: list[ID]) -> dict[ID, Rank]:
        comment_ranks: dict[ID, Rank] = {}

        for position, comment_id in enumerate(comment_ids):
            comment_ranks[comment_id] = len(comment_ids) - position

        children_ranks = await asyncio_gather_batched(
            [self._query_nested_ranks(comment_id) for comment_id in comment_ids],
            batch_size=self.importer.api_batch_size_firebase,
            batch_timeout_sec=self.importer.api_batch_timeout_sec,
        )
        for child_ranks in children_ranks:
            comment_ranks.update(child_ranks)

        return comment_ranks

    async def _query_nested_ranks(self, comment_id: ID) -> dict[ID, Rank]:
        if self._ranking_limit_count + 1 > self.importer.api_threads_ranking_limit:
            return {}
        self._ranking_limit_count += 1
        self._log(
            f"ranking #{self._ranking_limit_count}, limit={self.importer.api_threads_ranking_limit}"
        )

        item_json: firebase.Comment = await self.importer._request(
            f"{self.importer._api.firebase}/item/{comment_id}.json"
        )
        if comment_ids := item_json.get("kids", []):
            return await self._derive_ranks_recursively(comment_ids)
        return {}

    def _log(self, text: str):
        self.importer._log(f"[{self.post_root.id}] {text}")
