# Code Style

### Write simple, self-documented code

Devs overestimate their intelligence - KISS.

Comments
- Every comment is a tech debt - it'll fuck you up once outdated.
- Use only for unusual cases - tell why, not what.

### Manage complexity

You're working on a pre-MVP pre-PMF codebase:
- You must minimize surface area - every line of code is tech debt.
- Extreme complexity engineering is a must for survival.
- Must avoid the hell of "cheaper to rewrite from 0 than comprehend".

#### Defensive code in an MVP is tech debt

- Write clean code instead handling hypothetical edge-cases.
- Fail fast - use `assert` or `!` instead of complex error handling.
- Assume backend enforces invariants. Use `?.` chaining, not defensive `if`s.
- Always report errors - to the users and Sentry.

#### Best practices

- Functions > 20 lines → decompose. Think of later debugging prod at 3am.
- Extract explanatory variables and functions.
- When objects are used only in one place - keep them together, esp if the file < 200 LOC.
- Define variables at the point of use.
- Single-use vars → inline as named args.
- In functions accept objects over primitives: `update(user: User)` not `update(id: string)`.
- Avoid non-KISS constructs as `reduce` or list comprehensions.
- Use or create wrappers to declutter bad API of third-parties (eg Playwright).

## Tags

Code blocks can be marked with:
- `#AI` - not fully reviewed LLM code → consider dangerous
- `#AI-slop` - trash to drop
- `#bad-infer` - broken TS type inference - over time check if they fixed it
- `#prob-redundant` - may not be useful, but removal isn't a priority
- `#draft` - not working, or not ready for prod
- `#E2E-fails` - can be added to Git commit body (as we lack E2E CI atm)

## Detailed rules

If you need to enforce the code style - read and use [code-style-detailed](/docs/code-style-detailed.md).
