# Code Style Detailed

*This guide is helpful, but too much for LLM's context at all times - ie it's almost "CatAttack". We give it to subagents to clean code up.*


## Best practices

- Group related vars or constants by domain. No `UPPER_CASE` vars
- Prefer function parameters over outer scope: `await fetch(url, { timeoutSec: 5 });`
- 2+ uses of strings → consider local var
- Use absolute imports only, see tsconfig.json for `path`s
- Project-specific classes or functions are prefixed with `neuron`

### Naming functions

As `{category} {noun} {verb}`: `{category}` creates logical modules at a glance (in files or file tree), and `{noun} {verb}` is how brain works.

Examples:
- `post_review_create`, not `create_post_review`
- `handleCommentSubmit`, not `submitHandleComment`

## TypeScript

- Always `ESNext`
- Named exports only
- No inline conditionals: `if (x) action()`

### Nullish coalescing

`??` for null/undefined, never `||` (preserves falsy).

### Types

- No `as any` or `any` where knowable; if used - must leave an explanation
- No destructuring (obscures origin), esp of React `props`; Exceptions are only tuple return types as in `useQuery`

### Function declarations only

```ts
// Good
function postReviewCreate(user: User) { }
// Bad
const postReviewCreate = (user: User) => { }
```

### GraphQL

Always use `gql-tada.FragmentOf` instead of hand-writing types, or fragment sub types as `PostCommentType["votes"]`. See current fragments in `client/src/graphql/fragments/`.


## React

We must keep `props` types inlined, not in `interface`. If you need the type use `ComponentProps<typeof Comp>`.

### Chakra

Prefer
- `<For>` over `.map()`
- `<Show>` over ternaries
