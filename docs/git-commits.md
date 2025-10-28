---
reviewed_at: 2025.08.27
---

Good Git commits allow to quickly fix prod at 3am by eye-scanning the log.

We use an iteration over [conventionalcommits.org](https://www.conventionalcommits.org).

The main differences:
- focus on dev visual comprehension, not release notes gen
- `!` is used to show changes impact. Eg a squashed `feat` commit can change half the codebase, vs a `feat` for a new UI button.
- `BREAKING CHANGE`s are added to the body - for self-hosting users.
- `Refs:` required not in the footer, but the first line - they render as `<a href> in GitHub.

Conventions:
- capitalize Django models, React components, product names, etc - to visually distinct them
- model sub-types as `Post(type=Review)` are shortened to `Review`

Examples:
- `feat(post-form): add 7 required fields`
- `! feat(tags): tags sorting per User Review #126`
- `refac(API): prefetch tags and Review QuerySets #122`
- `docs(git-commits): add scopes`
- `build(monitor): add Sentry`

### Type

- `fix`
- `feat`
- `refac` - refactor, cleanups, performance, etc
- `test` - e2e or pytest, ie no runtime impact
- `build` - CI, dependencies, dev containers, dev tools, etc
- `UI` - UI-only changes, eg if no code review is needed
- `format` - code style or formating
- `docs`

### Scopes

If you're unsure which `Scope` to use, use the highest in the list below - they're sorted by importance.

Some `Scope`s are bound to a single `Type`, eg `build(AI)`.

- `post-form` - the most complex `react-hook-form`s for `Post` creation/editing
- `importer` - for `apps.importer`
- `tags` - `PostTag` logic
- `comment` - re create, edit, vote, etc
- `upgrade[<uv|Bun>]` - pyproject.toml, package.json, lock files, or related changes
- `E2E` - Playwright
- `API` - API layers: Apollo GraphQL, Strawberry resolvers, etc
- `gen` - `tests/test_gen::Gen` and `db_stubs_repopulate`
- `auth` - `apps.users`, permissions, etc
- `build(AI)` - Claude, Aider, etc
- `build(Mise)` - eg `mise.toml`
- `build(Docker)`
- `build(Coder)` - mostly `devops/` dir changes for Coder.com
- `monitor` - eg Sentry
- `types` - TypeScript or Python typings
- `admin` - Django Admin, ie no impact on the user-facing logic
- `perf` - performance of SQL, UI, etc
- `CI` - GitHub CI or others

#### Unused
- `browsr` - browser extension
- `track` - analytics tracking, eg PostHog

#### Special `Scope`s for `docs`
- `refac` - refactoring of text
- `refac-pending` - for refactor-pending.md file
- `arch` - abbreviation of `docs(architecture)`
- `README` - either `server/` or `client/` or root `/` README files
- `roadmap` - `docs/roadmap/*`
- `{file name without the ".md" extension}`

### Tags

Added at the end of a commit first line. See [Tags](/docs/code-style.md#Tags)

### Text style

- First noun, then verb.
- If the brain can read it - the shorter the better
	- Target visual scanning, not legalese
	- Fuck English grammar, eg redundant prefixes "the / a / an"
- For attributes of an object known form context - prefix with a dot. Eg `.tags`, instead of `Post.tags`.

#### Bad shortening

Bad to replace familiar words with less familiar:
- `brwsr` for `browser` - bad
- `smth` for `something` - fine, known
- `mgmt` for `management` - bad. Might be ok in a small team.

Bad if brain is familiar with a sentence (set of "tokens"), but it's written as abbreviations, eg:
- bad: `refac: imprv auth w/ opt JWT tkn & upd usr mgmt admn`
- ok: `refac(auth): optimize JWT token; cleanup user admin`
