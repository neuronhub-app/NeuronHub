---
reviewed_at: 2025.07.22
---

For a good commit: target the case of somebody breaking the code to be able to quickly find the cause by scanning the Git log.

The project is using an iteration over the [conventionalcommits.org](https://www.conventionalcommits.org).

The main difference is no need for breaking changes indication. And the `!` is used to show changes importance. Eg squashed commits may contain dozens KLOCs, vs a `feat` with a new UI input or something.

Examples:
- `feat: add 7 required fields to ReviewCreateForm`
- `refac(tags): pagination #126`
- `build(monitor): add Sentry`
- `refac(API): prefetch tags and Review QuerySets #122`
- `docs(git-commits): scopes`
- `! feat(tags): sort by user per Review #126`

### Type

- `feat` - features or additions
- `fix` - bug fixes or removals
- `refac` - refactor, cleanups, perf, etc
- `test` - stability improvements, that should be unable to damage runtime code
- `build` - CI, dependencies, compiler configs, etc
- `UI` - visual-only changes, eg in `client/`, where most often no code review needed
- `docs`
- `format` - code style or formating

### Scopes

- `API` - backend & strawberry types, mutations, etc. Usually without `clients/` changes.
- `upgrade` - Done often and usually has no changes outside the lock-files.
- `auth` - apps.users or frontend logic for it, hijacking, permissions, etc
- `tags` - related to FE or BE tags implementation
- `AI` - tools as Claude, Aider, etc
- `admin` - Django Admin related
- `gen` - changes to `apps/tests/test_gen::Gen` and `db_stubs_repopulate`
- `monitor` - Sentry, Datadog, etc
- `types` - TypeScript or Python typings
- `E2E` - Playwright, ie integration tests
- `Docker`
- `Coder` - coder.com
- `Mise` - eg mise.toml

Unused:
- `brows` - browser extension
- `track` - PostHog or other changes re analytics and activity tracking

Extra Scopes for the `docs` Type:
- `refac`
- `glossary`
- `arch` - for [architecture.md](/docs/architecture.md) file
- `README` - either `server/` or `client/` or root `/`
- `{file name wo ".md"}`

### Text style

As long as human brain can read it - the shorter the better, regardless of the grammar. Especially with rudimentary/inconsistent English conventions, that don't exist in other languages, eg as prefixes "the/a/an".

Shortening into non-cognitively familiar words is bad, eg:
- "brwsr" - "browser" - unknown, bad
- "smth" - "something" - known, ~ok
- "mgmt" - "management" - in a small team ok, but not readable for this project

Write first noun, then its verb.

Shortening is bad when a sentence the brain usually perceives as a set of "tokens" is turned into a rare mix of abbreviations, eg:
- bad: `refac: imprv auth w/ opt JWT tkn & upd usr mgmt admn`
- ok: `refac(auth): JWT token optimize; user admin cleanup`
