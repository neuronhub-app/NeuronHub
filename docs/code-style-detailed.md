---
description: For LLM-driven code cleanup. LLM needs it in a separate prompt to not impair its problem-solving.
---


# Code Style Detailed


## Every line of code is tech debt

All code is tech debt. Either current or future, no fucking difference.

Every redundant line MUST be removed. Every redundant word must be removed.


## Best practices

- Group related vars (or constants) by domain in an object. No dumb Java-style whole scope `UPPER_CASE` vars, we aren't in 2005.
- Prefer function named parameters over outer scope
- 2+ uses of strings → define them in a local var
- Use absolute path imports only, see `tsconfig.json`'s `path`
- Project-specific classes or functions are prefixed with `neuron`

### Comments

If there's a comment - human brain skips class/function naming (and whatever) to read the comments first.

Hence a comment is not only the future tech debt - it is also the highest-level information noise, the damages code comprehension by its mere existence.

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

No `as any` or `any` where knowable; if used - must leave an explanation.
- If TS inference is broken - comment with `// @ts-expect-error ts-bad-inference {reason}`. The `{reason}` should explain when it's worth trying to remove the exception.

### No destructing

No destructuring, because it obscures the origin. Especially of React `props`. There are ONLY 2 exceptions:
- tuple return types
- `useApolloQuery` - because it's the standard exception in this codebase. This exception is ONLY for Components with a SINGLE `useApolloQuery`, ie the `data` var is not ambiguous in the local context.

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

We must keep `props` types inlined, not in an `interface`. If you need the type use `ComponentProps<typeof Comp>`.

### Chakra

Prefer
- `<For>` over `.map()`
- `<Show>` over ternaries
