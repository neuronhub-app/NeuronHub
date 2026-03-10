---
paths:
  - server/neuronhub/apps/posts/index.py
  - server/neuronhub/apps/jobs/index.py
  - client/src/components/algolia/**
---

## Indexes

Each Model ha an Index with env postfix: `{name}_{DJANGO_ENV.value}`. Mise adds `env.USER` suffix to avoid dev clashes, eg `posts_dev_john`.

- `posts` - [[server/neuronhub/apps/posts/index.py]]
- `jobs` - [[server/neuronhub/apps/jobs/index.py]]
- `profiles` - [[server/neuronhub/apps/profiles/index.py]]

FE index names are in [[client/src/utils/useAlgoliaSearchClient.ts]].

### Serialization

We serialize models on BE using GraphQL queries (eg `PostsByIds`, `JobsByIds`) in `_get_graphql_field`. This keeps the single-place GraphQL [cache reset](/docs/architecture/frontend/GraphQL.md#cache-reset): on list pages, Algolia hits are enriched via [[useAlgoliaEnrichmentByGraphql.ts]] so `mutateAndRefetchMountedQueries` auto-refetches on mutations.

### Virtual replicas

For sorting both `posts` and `jobs` have replicas that need `client.set_settings` - hence we always use our `neuronhub.apps.algolia.services.algolia_reindex()` instead of Algolia's `reindex_all()`.

### Partial updates

Example:

```python
algolia_engine.client.partial_update_objects(
    index_name=f"{ProfileIndex.index_name}{settings.ALGOLIA['INDEX_SUFFIX']}",
    objects=[
        {
            "objectID": profile.id,
            # ... more fields
        }
        for profile in profiles
    ],
    wait_for_tasks=False,
)
```

Note: `update_records` will not work for different field values - it's the same as `QuerySet.update()`.

## Shared FE components (`components/algolia/`)

`AlgoliaList` is the master container (header, search, sort, facets sidebar, hits, pagination) used by Jobs, Reviews, and Tools lists. Also exports `AlgoliaHits` for custom layouts (Profiles, Posts).

Facet components: `AlgoliaFacetAttribute` (checkbox), `AlgoliaFacetBoolean`, `AlgoliaFacetDate`, `AlgoliaFacetSalary` (range slider). All use `export const facetStyle` from `AlgoliaFacets.tsx` and Chakra semantic tokens for theme-awareness across sub-sites.

Sub-sites (eg `sites/pg/`) reuse these components without changes - see [Sub-sites](/docs/architecture/frontend/Sub-sites-with-VITE_SITE.md).

## Testing

- Pytest: Algolia is disabled.
- E2E: uses an Index with its env suffix, eg `posts_dev_test_e2e`
