# Code Style


## Core Principles

### You MUST write dumb self-documented code

- Devs overestimate self intelligence - KISS
- Extract explanatory variables and functions

Comments
- Comments are a terrible code smell, and are ONLY for unusual cases (tell why, not what)
- Every comment is a tech debt, it'll fuck up devs once outdated

### You MUST manage complexity

You're working on a pre-MVP pre-PMF codebase. Extreme complexity engineering is a must for project survival.

- You MUST minimize surface area - every line of code is a fucking tech debt
- Projects die from idiotic tech debt - it's always cheaper to rewrite from 0 than read shit

#### Error handling
- Always prefer clean code instead handling potential library issues
- Fail fast - use `assert` or `!` instead of complex error handling
- Never conceal errors instead of eg sending to Sentry 

#### Best practices
- Group related vars or constants by domain. No `UPPER_CASE` vars.
- Define variables at point of use
- Functions > 20 lines → decompose. Think debugging prod at 3am
- When functions or classes are used only in one place - keep them together, esp if file is below 200 LOC
- Prefer function parameters over outer scope: `await fetch(url, { timeoutSec: 5 });`
- Single-use vars → inline as named parameters
- 2+ uses of strings → consider local var
- Name functions as `{category} {noun} {verb}`: `{category}` creates logical modules at a glance (in files or file tree), and `{noun} {verb}` is how brain works. Examples: 
  - `post_review_create`, not `create_post_review`
  - `handleCommentSubmit`, not `submitHandleComment`
- In functions accept domain objects over primitives: `update(user: User)` not `update(id: string)`
- Avoid "smart" constructs as `reduce` or list comprehensions 
- Create wrappers to declutter bad syntax from Python, TypeScript, or third-party
- Project-specific classes or functions are prefixed with `neuron`.

## TypeScript

- Always `ESNext`
- Named exports only
- No inline conditionals: `if (x) action()`

### Nullish coalescing

`??` for null/undefined, never `||` (preserves falsy).

### Types

- No `as any` or `any` where knowable; if used - must leave an explanation
- No destructuring (obscures origin), esp of React `props`; Exceptions are only tuple return types as in `useQuery`

### Defensive coding is tech debt

Assume backend enforces invariants. Use `?.` chaining, not defensive `if` forests.

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

### Components

```tsx
export function UserCard(props: { user: User; className?: string }) {
  // 1. Defaults
  const className = props.className ?? "default";
  
  // 2. Hooks
  const userQuery = useUserCurrent();
  const userSnap = useSnapshot(user.state);

  // 3. State
  const state = useValtioProxyRef({ isDialogOpen: false });
  
  // 3. Handlers
  function handleClick() {
  }

  // 4. Render values (closest to JSX)
  const name = props.user.name ?? "Anonymous";
  
  return (
    <DialogRoot
      open={state.snap.isDialogOpen}
      onOpenChange={event => state.mutable.isDialogOpen = event.open }
    >
    </DialogRoot>
  );
}
```

You must keep `props` types inlined, not in `interface`. If you need the type use `ComponentProps<typeof Comp>`.

### Chakra v3

Prefer
- `<For>` over `.map()`
- `<Show>` over ternaries
