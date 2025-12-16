# Code Style

## Core Principles

### Write simple, self-documented code

- Devs overestimate self intelligence - KISS
- Extract explanatory variables and functions

Comments
- Comments are a terrible sign, and used only for unusual cases - tell why, not what.
- Every comment is a tech debt - it'll fuck you up once outdated.

### Manage complexity

You're working on a pre-MVP pre-PMF codebase:
- You must minimize surface area - every line of code is tech debt
- Extreme complexity engineering is a must for survival
- We must avoid the hell of "*cheaper to rewrite from 0 than comprehend*"

#### Defensive code in an MVP is tech debt

- Write clean code instead handling potential library issues
- Fail fast - use `assert` or `!` instead of complex error handling
- Assume backend enforces invariants. Use `?.` chaining, not defensive `if`s
- Always show errors - to user and Sentry

#### Best practices

- Define variables as close as possible to the point of use
- Functions > 20 lines → decompose. Think of later debugging prod at 3am.
- When objects are used only in one place - keep them together, esp if file is below 200 LOC
- Single-use vars → inline as named args
- In functions accept objects over primitives: `update(user: User)` not `update(id: string)`
- Avoid "smart" constructs as `reduce` or list comprehensions 
- Create wrappers to declutter bad syntax from third-parties

## Tags

Code blocks can be marked with:
- `#AI` - not fully reviewed or tested LLM code → consider dangerous
- `#AI-slop` - trash to drop or rewrite
- `#bad-infer` - broken TS type inference - over time check if they fixed it
- `#prob-redundant` - may not be useful, but removing will require extra testing
- `#draft` - not working or not ready for prod

## Extra

If you were told to enforce the code style - read the [code-style-detailed](/docs/code-style-detailed.md).
