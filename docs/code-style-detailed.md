---
description: For LLM-driven code cleanup. LLM needs it in a separate prompt to not impair its problem-solving.
---


Code Style Detailed
----------------------------------------

Every line of code is tech debt
========================================

All code is tech debt. Either current or future, no fucking difference.

Every redundant line MUST be removed. Every redundant word must be removed.


Best practices
========================================

- 2+ uses of strings → define them in a local var
- Use absolute path imports only, see `tsconfig.json`'s `path`
- Project-specific classes or functions are prefixed with `neuron`

### Comments

If there's a comment - human brain skips class/function naming (and whatever) to read the comments first.

Hence a comment is not only the future tech debt - it is also the highest-level information noise, the damages code comprehension by its mere existence.

### TODO comments

See [todos.md](/docs/todos.md).

### Group related variables by domain in an object

```ts
// Bad
const toolData = forms.tool.getValues();
const reviewData = forms.review.getValues();

// Good
const data = {
  tool: forms.tool.getValues(),
  review: forms.review.getValues(),
};
```

In Python use a lowercase-named dataclass / class.

### Use function named parameters over redundant vars

```ts
// Bad:
const input = {
  ...data.review,
  parent: { id: response.data.create_post.id },
};
await mutateReview(input);

// Good:
await mutateReview({
  input: {
    ...data.review,
    parent: { id: response.data.create_post.id },
  }
});
```

### Naming functions

As `{category}? {noun} {verb}`: `{category}` creates logical modules at a glance (in files or file tree), and `{noun} {verb}` is how brain works.

Examples:
- `post_review_create`, not `create_post_review`

TypeScript
========================================

- Always `ESNext`
- Named exports only
- No inline conditionals: `if (x) action();`
- instead of `useState` use `useValtioProxyRef`. Unless there's a tangible maintenance benefit to `useState`

### Error handling

Never pollute console logs. Use Sentry's `captureException` or `logger.{level}()` 

### Nullish coalescing

`??` for null/undefined, never use `||` (preserves falsy).

### Types

If TS inference is broken - comment with `// @ts-expect-error #bad-infer {reason}`. The `{reason}` should explain when it's worth trying to remove the exception.

### No destructing

No destructuring, because it obscures the origin. Especially of React `props`. There are ONLY 2 exceptions:
- tuple return types
- `useApolloQuery` - because it's the standard exception in this codebase. This exception is ONLY for Components with a SINGLE `useApolloQuery`, ie the `data` var is not ambiguous in the local context.

### Function declarations only

```ts
// Good
function mutateReview(user: User) { }
// Bad
const mutateReview = (user: User) => { }
```
