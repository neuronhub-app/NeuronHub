We use Algolia `posts.Post` model index as the list view on FE, with its Search, Facets, and
Pagination.

We only have one index of Posts (with postfixes per env): `posts_{DJANGO_ENV.value}`, defined in
`neuronhub/apps/posts/index.py`.

We serialize `Post` using the Strawberry base types to match our GraphQL schema, eg `Post.tags` is
indexed as a JSON of `list[PostTagTypeBase]`, and we export `PostTagType(PostTagTypeBase)`, matching
the FE `PostTagFragment` and its typings.

`Post.Comment` are excluded via `Post.is_in_algolia_index()`, as they aren't on FE `/posts` pages.

### Testing

- Pytest: Algolia disabled via `NeuronTestCase` override
- E2E: uses index with its suffix - `posts_dev_test_e2e`

### Related Files

- [[server/neuronhub/apps/posts/index.py]]
- [[server/neuronhub/apps/posts/models/posts.py]]
- [[client/src/apps/posts/list/PostListAlgolia.tsx]]
