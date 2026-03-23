---
reviewed_at: 2026.03.18
paths:
  - "**/*.tsx?"
---


### Persisted Queries

You must define queries on the top module level for gql-tada CLI to detect them, and update the whitelist on `mise lint`, eg:
```ts
import { graphql } from "@/gql-tada";

const PostListQuery = graphql.persisted(
  "PostList",
  graphql(`query PostList { posts { ...PostFragment } }`, [PostFragment]),
);
```


### Types

Instead of writing types by hand, uou must use `gql-tada.ResultOf` or `FragmentOf`, eg:

```ts
type PostList = ResultOf<typeof PostListQuery>;
export type Post = NonNullable<PostList["posts"]>[number];
```

If need to narrow the type - utilize the `is` keyword, eg: 
`function isPost(post: Post | unkonwn): post is Post { return post.__typename === "PostType" }`.


### Reset the cache on every mutation

You must use [[mutateAndRefetchMountedQueries.tsx]] function instead of `client.mutate`, to mitigate Apollo's dysfunctional caching. It also has `mutateDeleteAndResetStore()`, as `client.refetchQueries({ include: "all" })` does not refetch all queries.

By default it calls `refetchQueries({ include: "active" })`, but you can configure it with `options` as:
- `{ isRefetchAll: true }` -> `client.refetchQueries({ include: "all" })`
- `{ isResetAndRefetchAll: true }` -> `client.resetStore(); client.refetchQueries({ include: "all" })`

Note: errors they already send to `Sentry.captureException` - no need to duplicate it.

#### Exceptions for using `client.mutate`

1. If re-renders can have extreme performance consequences - eg in `posts` we avoid re-rendering 1000 comments on upvotes or content highlights.
2. If you're mutating a single known (obvious) GraphQL query - eg when creating `JobAlert`s we simply specify `refetch: [JobAlertsQuery]` to avoid UX disruptions. In this case you must `import` the `query` - and never use its magic string name.


### Use `useApolloQuery` instead of `apollo.useQuery`

Always use `[[useApolloQuery.ts]]` instead of the Apollo's `useQuery`.

And instead of its `.loading` var use `.isLoadingFirstTime` - which doesn't activate when we call `mutateAndRefetch*()` - ie when we soft-refetch the data, instead of being blocked by its first load.
