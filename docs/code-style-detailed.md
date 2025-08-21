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
- instead of `useState` use `useValtioProxyRef`. Unless there's a tangible maintenance benefit to `useState`

### Error handling

Never pollute console logs. Use Sentry's `captureException` or `logger.{level}()` 

### Nullish coalescing

`??` for null/undefined, never `||` (preserves falsy).

### Types

No `as any` or `any` where knowable; if used - must leave an explanation.
- If TS inference is broken - comment with `// @ts-expect-error #bad-infer {reason}`. The `{reason}` should explain when it's worth trying to remove the exception.

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

Always inline queries if used only in one place, ie never create `UPPER_CASE` var.

Always use `gql-tada.FragmentOf` instead of hand-writing types, or fragment sub types as `PostCommentType["votes"]`. See current fragments in `client/src/graphql/fragments/`.


## React

We must keep `props` types inlined, not in an `interface`. If you need the type use `ComponentProps<typeof Comp>`.

### Chakra v3

#### Semantic Tokens

Always use semantic tokens when available. Create new tokens if helps.

Without tokens the styles become an unmanageable clusterfuck.

For spaces always `gap.{token}` - our spacing is symmetrical. Add new ones if helps, or create aliases for the existing skeleton.

For colors always use the adaptable tokens (eg `bg="bg.subtle"`, not `black`), because we support light and dark mode natively.

To get the raw values use the `system` from `theme.ts`, eg `system.token("colors.danager")`. Or the new syntax for strings `"{colors.red}"`.

`mise lint` will re-generate Chakra theme types and tokens to lint them.

#### Code Style

Prefer
- `<For>` over `.map()`
- `<Show>` over ternaries
