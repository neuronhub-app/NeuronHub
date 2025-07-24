# Code Style Guide


## Core Principles

### Dependency Order
Write code in topological order. Dependencies before dependents.

### Self-Documenting Code
No comments explaining *what* - only *why* when non-obvious. Extract explanatory variables.

### Minimize Surface Area
Every line is tech debt. Prefer composition.

### Extract Early
Functions > 20 lines → decompose. Think debugging prod at 3am.

### Minimize Scope
- Define variables at point of use
- Prefer function parameters over outer scope: `await fetch(url, { timeout: 5000 });`
- Single-use values → inline as named parameters

### Constants
Group by domain:
```ts
const selectors = {
  userCard: '[data-testid="user-card"]',
  submitBtn: 'button[type="submit"]',
} as const;
```


## TypeScript

- Always `ESNext`
- Named exports only.
- No inline conditionals: `if (x) doThing();`

### Function Declarations Only
```ts
// ✓ function processUser(user: User): ProcessedUser { }
// ✗ const processUser = (user: User) => { }
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
Prefer `<For>` over `.map()`, `<Show>` over ternaries.
