---
reviewed_at: 2026.01.13
---

A good Git commit allows to quickly fix prod at 3am by eye-scanning the log, or searching commit bodies.

We use an iteration over [conventionalcommits.org](https://www.conventionalcommits.org).

The main differences:
- focus on visual comprehension, not release notes generation
- `!` is used to indicate changes impact. Eg a squashed `! feat:` commit can change half the codebase, vs a `feat:` with a new UI button.
- `BREAKING CHANGE`s are added only self-hosting users to the commit body.
- `Refs:` are optional, and preferably placed in the first line to render as `<a href>` in GitHub log. Less important refs are placed in the body.

Conventions:
- capitalize the domain language: Django models, React components, etc - to visually distinct them
- model sub-types as `Post(type=Review)` are shortened to `Review`
- React components are placed in brackets as `<LayoutSidebar/>`

Examples:
- `feat(post-form): add 7 required fields`
- `! feat(tags): tags sorting per User Review #126`
- `refac(API): prefetch tags and Review QuerySets #122`
- `docs(git-commits): add scopes`
- `build(monitor): add Sentry`

### Types

- `fix`
- `feat`
- `refac` - refactor, cleanups, performance, etc - non-breaking/critical changes
- `test` - E2E or pytest - no runtime impact
- `build` - CI, dependencies, dev containers, dev tools, etc
- `UI` - UI-only changes, eg when no code review is needed
- `format` - code style or formating
- `docs`

If you're unsure which `Type` to use - use the highest, as they're sorted by importance.

### Scopes

- `post-form` - the most complex `react-hook-form`s for `Post` creation/editing
- `tags` - `PostTag` logic
- `comment` - re create, edit, vote, etc
- `importer` - for `apps.importer`
- `profile` - for `apps.profiles`
- `upgrade[<uv|Bun>]` - pyproject.toml, package.json, lock files, or related changes
- `API` - API layers: Apollo GraphQL, Strawberry resolvers, etc
- `auth` - `apps.users`, models, permissions, etc
- `sec` - security, unrelated to `apps.users`
- `Algol` - Algolia's integration
- `monitor` - eg Sentry
- `types` - TypeScript or Python typings
- `admin` - Django Admin, ie no impact on the user-facing logic
- `perf` - performance of SQL, UI, etc

`Scope`s only for Type `build` (as they shouldn't affect runtime):
- `build(CI)` - GitHub CI
- `build(Mise)` - eg `mise.toml`
- `build(Docker)` - Dockerfiles outside of Mise
- `build(AI)` - Claude, Aider, etc
- `build(Coder)` - mostly `devops/` dir changes for Coder.com

`Scope`s only for Type `test` (as they must not affect prod):
- `test(E2E)` - Playwright
- `test(gen)` - `tests/test_gen::Gen` and `db_stubs_repopulate`

`Scope`s only for Type `docs`:
- `refac` - refactoring of text
- `refac-pending` - for refactor-pending.md file
- `arch` - abbreviation of `architecture`
- `README` - only 3 options: README file in `server/`, `client/`, or root `/` 
- `roadmap` - `docs/roadmap/*`
- `{file name without the ".md" extension}`

#### Unused
- `browsr` - browser extension
- `track` - analytics tracking, eg PostHog

### Tags

Added at the end of a commit first line. See [Tags](/docs/code-style.md#Tags)

### Text style

- First noun, then verb.
- If the brain can read it - the shorter the better.
	- Target visual scanning, not legalese.
	- Fuck English grammar, eg redundant prefixes "the / a / an".
- For attributes of an object known form context - prefix with a dot. Eg `.tags`, instead of `Post.tags`.
- For React components - wrap in brackets as `<Name/>`.

#### Bad shortening

Bad to replace familiar words with less familiar:
- `brwsr` for `browser` - bad
- `smth` for `something` - fine, known
- `mgmt` for `management` - bad. Might be ok in a small team.

Bad if brain is familiar with a sentence (set of "tokens"), but it's written as abbreviations, eg:
- bad: `refac: imprv auth w/ opt JWT tkn & upd usr mgmt admn`
- ok: `refac(auth): optimize JWT token; cleanup user admin`
