## Code Style

- Comments are code smells - use descriptive file/fn/var names, self-documenting selectors, functions.
- In naming use information hierarchy, eg `button_upvote` not `upvote_button`
- No magic strings
- Explicit over implicit

### TypeScript

Define functions as `functions`, not `const`.

No inline `if (condition) experssion;`.

No `export default`.

Better to accept `option: Option` than `optionId: string` - avoid passing an unrelated string. 

React's Component order:
- hooks
- state
- functions
- vars (style, data transformers, etc)
- return

### Types

Avoid fixing fake types, which is most of them.

Most common is wrong inference - mark it with `@bad-infer`/`@bad-infer-prob` and override types.

Use non-null assertion to fix wrong types.
