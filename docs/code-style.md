# Code Style


## Core Principles

### You MUST write self-explanatory code

- Extract explanatory variables.
- Name functions and variables thoughtfully.
- Create sub-functions to declutter bad Python or TypeScript syntax

### You MUST write self-explanatory code, not comments

- Each comment is a tech debt, waiting to fuck up those devs reading it instead of code
- Comments are a terrible code smell
- Comments are only for unusual cases - explaining why, not what

### You MUST manage complexity

You're working on a pre-PMF pre-MVP codebase. Without rigorous complexity engineering it's going to die from idiotic "best practices" before any users can see it.

- You MUST minimize surface area - every line of code is a fucking tech debt
- Projects die from idiotic tech debt, that's always cheaper to rewrite from 0 than refactor

#### Error handling
- Always write clean code instead handling potential library issues
- Fail fast - use `assert` or `!` instead of non-readable error handling
- Never hide errors instead of throwing to Sentry and moving on 

#### Best practices
- Group related vars or constants by domain. No `UPPER_CASE` vars.
- Define variables at point of use
- Functions > 20 lines → decompose. Think debugging prod at 3am
- Prefer function parameters over outer scope: `await fetch(url, { timeoutSec: 5 });`
- Single-use vars → inline as named parameters
- 2+ uses of strings → consider local var
- Name functions as `{category} {noun} {verb}`: `{category}` creates logical modules at a glance (in files or file tree), and `{noun} {verb}` is how brain works. Examples: 
  - `post_review_create`, not `create_post_review`
  - `handleCommentSubmit`, not `submitHandleComment`


## TypeScript

- Always `ESNext`
- Named exports only.
- No inline conditionals: `if (x) doThing();`

### Function Declarations Only
```ts
// Good
function postReviewCreate(user: User): ProcessedUser { }
// Bad
const commentSubmit = (user: User) => { }
```

### Nullish Coalescing
`??` for null/undefined, never `||` (preserves falsy).

### Type Discipline
- No `any` where knowable
- Domain objects over primitives: `update(user: User)` not `update(id: string)`
- No destructuring (obscures origin)

### Defensive Coding is Debt
Assume backend enforces invariants. Use `?.` chaining, not defensive `if` forests.

### Fix Bad Inference
```ts
// @ts-expect-error @bad-infer - returns string not number
const id = response.data.id as string;

const element = document.querySelector("#app")!; // Framework guarantees
```


## React

### Component Order

```tsx
export function UserCard(props: { user: User; className?: string }) {
  // 1. Defaults
  const className = props.className ?? "default";
  
  // 2. Hooks
  const userQuery = useUserCurrent();
  
  // 3. Handlers
  function handleClick() { }
  
  // 4. Render values (closest to JSX)
  const name = props.user.name ?? "Anonymous";
  
  return <Box></Box>;
}
```

### Chakra v3

Prefer
- `<For>` over `.map()`
- `<Show>` over ternaries
