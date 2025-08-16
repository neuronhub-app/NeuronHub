---
reviewed_at: 2025.08.15
---

A good Git commit allows to eye-scan log to fix prod at 3am.

We use an iteration over [conventionalcommits.org](https://www.conventionalcommits.org).
The main differences:
- no breaking changes focus
- `!` is used to show changes importance. Eg squashed commits may contain dozens KLOCs, vs a `feat` with a new UI input or something.

Examples:
- `feat(post-form): add 7 required fields`
- `refac(API): prefetch tags and Review QuerySets #122`
- `build(monitor): add Sentry`
- `docs(git-commits): add scopes`
- `! feat(tags): sorting per PostReview #126`

### Type

- `fix`
- `feat`
- `refac` - refactor, cleanups, performance, etc
- `test` - stability; should have no runtime impact
- `build` - CI, dependencies, compilation, etc
- `UI` - visual-only changes, eg when no code review needed
- `format` - code style or formating
- `docs`

### Scopes

- `API` - GraphQL, Strawberry, mutations, etc
- `upgrade` - usually lock-files
- `auth` - apps.users, permissions, etc
- `tags` - `PostTag`, etc
- `AI` - Claude, Aider, etc
- `gen` - `tests/test_gen::Gen` and `db_stubs_repopulate`
- `monitor` - eg Sentry
- `Coder` - devops/ for coder.com
- `Mise` - eg `mise.toml`
- `Docker`

Frontend:
- `E2E` - Playwright
- `post-form` - our complex React Form: `posts/create` or `reviews/create`
- `comment` - create, edit, vote, etc

#### Unused
- `admin` - Django Admin
- `types` - TypeScript or Python typings
- `brows` - browser extension
- `track` - analytics tracking, eg Posthog

#### Scopes for the `docs` Type:
- `refac`
- `glossary`
- `arch` - for [architecture.md](/docs/architecture.md) file
- `README` - either `server/` or `client/` or root `/`
- `{file name wo ".md"}`

### Text style

First noun, then verb.

If brain can read it - the shorter the better. Fuck the grammar and English, eg prefixes "the / a / an".

#### Bad shortening

Bad to replace familiar words with less familiar:
- `brwsr` for `browser`: bad
- `smth` for `something`: ok, known
- `mgmt` for `management`: bad here, ok in a small team

Bad if brain is familiar with a sentence (set of "tokens"), but it's written as abbreviations, eg:
- bad: `refac: imprv auth w/ opt JWT tkn & upd usr mgmt admn`
- ok: `refac(auth): JWT token optimize; user admin cleanup`
