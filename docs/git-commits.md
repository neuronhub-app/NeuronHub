---
reviewed_at: 2025.03.12
---

The project is using a colored iteration over the [conventionalcommits.org](https://www.conventionalcommits.org).

Emojis aren't used due to the cognitive overhead in interpreting their overcomplicated "3D" drawing style. I prefer minimalistic colored shapes, eg as circles, but UTF doesn't have them.

### Type

The shapes are chosen based on the usage frequency:
1. ⬜️
2. ⚪️
3. ◆

Color topics (tentative):
- 🟩 - positive novelty
- 🟦 - chores, maintenance, tests, refactor
- 🟧 - fixes
- 🟪 - UI/UX
- ⬜️ - no tech impact on the app runtime

The Type is written before a `:`, as:
- 🟩 - features
- 🟧 - bug fixes and reverts
- 🔶 - performance fixes/improvements
- 🟦 - refactor, cleanups
- 🔵 - CI, dependencies, compiler configs, etc
- 🔷 - test
- 🟪 - visual-only changes in `client/`, ie often needs no code review or testing
- ⬜️ - docs
- 🟫 - code style and formatting

### Scopes

In brackets `()` after the Type, as:
- BE - backend
- FE - frontend
- monitor - sentry, datadog, etc
- track - PostHog or other changes re analytics and activity tracking
- auth - apps.auth or frontend logic for it, hijacking, permissions, etc
- admin - django admin related
- types - TypeScript or Python typings
- API - related to strawberry structure and/or graphql types
- tags - related to FE or BE tags implementation
- brows - browser extension

Scopes for the docs ⬜️ type:
- refac
- glossary
- readme - either backend or frontend or root

### Commit style

Dropping verbs as "added"/"fixed"/etc is fine, as long as the respective colored `Type` UTF is used.

As long as human brain can read it - the shorter the better, regardless of the grammar.

But shortening into non-cognitively memorized words is bad, eg:
- `smth` - memorized, good
- `mgmt` - "management" - kind of ok, depending who the readers are
- `brwsr` - "browser" - bad, uncommon

Shortening is bad when sentence the brain usually perceives as a set of "token" is turned into a rare mix of single abbreviations, eg:

Bad
- 🟦(BE) imprv auth w/ opt JWT tkn & upd usr mgmt admn

Ok
- 🟦(BE) improve auth w optimized JWT token; cleanup user mgmt admin

In first line include the issue/PR ID at the end, to render as a clickable link in the IDE/github list view.

### Examples

- 🟩(tags) sort by user #1260
- 🔶(tags) pagination of list view #1261
- 🔶(API) prefetch on QS lists #1262

### Specs

For details see [conventionalcommits.org](https://www.conventionalcommits.org).
And [the Angular guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#type) that
I consider a fine example of implementing types/scopes. 
