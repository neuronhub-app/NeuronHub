---
paths:
  - server/neuronhub/apps/posts/index.py
  - client/src/apps/posts/list/PostListAlgolia.tsx
  - client/src/apps/posts/list/useAlgoliaPostsEnrichmentByGraphql.ts
---

We use Algolia `posts.Post` model Index as the list view on FE, with its Search, Facets, and Pagination.

We have one Index of Posts with postfixes per env: `posts_{DJANGO_ENV.value}`, defined in `neuronhub/apps/posts/index.py`.

To avoid dev Index clashes, Mise adds a suffix with the OS `env.USER` string, eg `posts_dev_john`.

### Posts serialization for Algolia Index

We serialize Posts on BE using the GraphQL query `PostsByIds` in [[Post#_get_graphql_field]].

It's done to keep using our single-place GraphQL [cache reset](/docs/architecture/frontend/GraphQL.md#cache-reset): on `/posts` page instead of showing Algolia's hits, we enrich it with [[useAlgoliaPostsEnrichmentByGraphql.ts]] by `PostsByIds` query. This allows our function `mutateAndRefetchMountedQueries` to auto-refetch the Posts on mutations as voting, adding to users_library, etc.

### Testing

- Pytest: Algolia is disabled.
- E2E: uses an Index with its env suffix - `posts_dev_test_e2e`

### Related Files

- [[server/neuronhub/apps/posts/index.py]]
- [[server/neuronhub/apps/posts/models/posts.py]]
- [[client/src/apps/posts/list/PostListAlgolia.tsx]]
- [[client/src/apps/posts/list/useAlgoliaPostsEnrichmentByGraphql.ts]]
