---
paths:
  - "**/*.tsx"
---

### Persisted Queries

You must define queries on the module top level for gql-tada CLI to put it in the whitelist, eg:
```tsx
import { graphql } from "@/gql-tada";

const PostListQuery = graphql.persisted(
  "PostList",
  graphql(`query PostList { posts { ...PostFragment } }`, [PostFragment]),
);
```

### Types

Always use `gql-tada.FragmentOf` instead of hand-writing types, or fragment sub types as `PostCommentType["votes"]`. See current fragments in `client/src/graphql/fragments/*`.

### Cache reset

You must use [[mutateAndRefetchMountedQueries.tsx]] function instead of `client.mutate` to mitigate Apollo's dysfunctional caching. It also has `mutateDeleteAndResetStore()`, as `client.refetchQueries({ include: "all" })` does not refetch all queries.

### useApolloQuery

For query loading - you MUST use `useApolloQuery`, and instead of its `loading` var use `isLoadingFirstTime` - which doesn't trigger the loading when we call `mutateAndRefetchMountedQueries()` - ie when we refetch rather than load first time.
