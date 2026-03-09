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

FE index names are in [[client/src/utils/useAlgoliaSearchClient.ts]].

### Serialization

We serialize models on BE using GraphQL queries (eg `PostsByIds`, `JobsByIds`) in `_get_graphql_field`. This keeps the single-place GraphQL [cache reset](/docs/architecture/frontend/GraphQL.md#cache-reset): on list pages, Algolia hits are enriched via [[useAlgoliaEnrichmentByGraphql.ts]] so `mutateAndRefetchMountedQueries` auto-refetches on mutations.

## Shared FE components (`components/algolia/`)

`AlgoliaList` is the master container (header, search, sort, facets sidebar, hits, pagination) used by Jobs, Reviews, and Tools lists. Also exports `AlgoliaHits` for custom layouts (Profiles, Posts).

Facet components: `AlgoliaFacetAttribute` (checkbox), `AlgoliaFacetBoolean`, `AlgoliaFacetDate`, `AlgoliaFacetSalary` (range slider). All use `export const facetStyle` from `AlgoliaFacets.tsx` and Chakra semantic tokens for theme-awareness across sub-sites.

Sub-sites (eg `sites/pg/`) reuse these components without changes - see [Sub-sites](/docs/architecture/frontend/Sub-sites-with-VITE_SITE.md).

## Testing

- Pytest: Algolia is disabled.
- E2E: uses an Index with its env suffix, eg `posts_dev_test_e2e`
