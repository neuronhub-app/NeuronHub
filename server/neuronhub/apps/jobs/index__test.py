"""
#AI #quality-20% - drop this test if it gets in the way.

Contract: every leaf path of `JobsByIds` GraphQL must exist in Algolia raw record,
so PG renders Algolia hits as `JobFragmentType` w/o enrichment.
See [[JobList.tsx]] (PG) + [[Algolia.md]].

False-green risks:
- Leaf-only, no types: `id: String -> Int` or `salary_min: 0` (Algolia
    `get_salary_min_or_zero`) vs `null` (GraphQL) passes silently.
- Empty list yields prefix as leaf: must populate every list-typed
    fragment field, else missing shape under it goes undetected.
- One-way `graphql <= algolia`: extra Algolia fields are allowed.

Refs: #182
"""

from collections.abc import Iterator

import pytest
from asgiref.sync import sync_to_async
from django.conf import settings
from django.test import RequestFactory

from neuronhub.apps.graphql.persisted_query_extension import _load_client_persisted_queries_json
from neuronhub.apps.jobs.models import Job
from neuronhub.apps.posts.graphql.types_lazy import TagCategoryEnum
from neuronhub.apps.tests.test_cases import NeuronTestCase
from neuronhub.apps.tests.test_cases import StrawberryContext
from neuronhub.graphql import schema


class JobIndexContractTest(NeuronTestCase):
    @pytest.mark.skipif(not settings.ALGOLIA["IS_ENABLED"], reason="Required")
    async def test_algolia_record_covers_jobsbyids_paths(self):
        from neuronhub.apps.jobs.index import JobIndex

        tags = [
            await self.gen.posts.tag(category=TagCategoryEnum.Skill),
            await self.gen.posts.tag(category=TagCategoryEnum.Area),
            await self.gen.posts.tag(category=TagCategoryEnum.Education),
            await self.gen.posts.tag(category=TagCategoryEnum.Experience),
            await self.gen.posts.tag(category=TagCategoryEnum.Workload),
        ]
        job = await self.gen.jobs.job(
            tags=tags,
            locations=[await self.gen.jobs.location("London")],
        )

        adapter = JobIndex(Job, client=None, settings=settings.ALGOLIA)
        algolia_record = await sync_to_async(adapter.get_raw_record)(job)

        request = RequestFactory().get("/graphql")
        request.user = self.user
        result = await schema.execute(
            query=_load_client_persisted_queries_json()["JobsByIds"],
            variable_values={"ids": [job.id]},
            context_value=StrawberryContext(request=request),
        )
        assert not result.errors, result.errors
        jobs_graphql = result.data["jobs"]
        assert jobs_graphql, "JobsByIds returned no jobs"

        paths_graphql = set(_iter_leaf_paths(jobs_graphql[0]))
        paths_algolia = set(_iter_leaf_paths(algolia_record))

        paths_missing = paths_graphql - paths_algolia
        assert not paths_missing, (
            f"Algolia missing paths required by JobsByIds: {sorted(paths_missing)}"
        )


type Json = dict[str, "Json"] | list["Json"] | str | int | float | bool | None


def _iter_leaf_paths(node: Json, prefix: str = "") -> Iterator[str]:
    if isinstance(node, dict):
        for key, value in node.items():
            yield from _iter_leaf_paths(value, f"{prefix}.{key}" if prefix else key)
    elif isinstance(node, list) and node:
        yield from _iter_leaf_paths(node[0], f"{prefix}[]")
    else:
        yield prefix
