---
reviewed_at: 2025.03.24
---

The project is using a symbol-based iteration over the [conventionalcommits.org](https://www.conventionalcommits.org).

Emojis aren't used due to the cognitive overhead in interpreting their platform-bound inconsistent "3D" drawing style. I prefer minimalistic shapes, eg as circles, but UTF tends to turn them into pictures. The target is plaintext that can be colored by the end reader GUI/TUI eg with regexes, if desired.

### Type

The Type is written before the commit, as:
- `+` - features (additions)
- `-` - bug fixes and reverts (removals)
- `~` - refactor, cleanups, perf, etc (no intentional changes, additions/deletions, hence `~`)
- `=` - tests (stability improvements that should be unable to damage anything runtime related, hence the double horizontal line)
- `^` - CI, dependencies, compiler configs, etc (improvements of deploy, hence the arrow up)
- `@` - visual-only changes, eg in `client/`, most often no code review needed (no better idea than `@`, since it's kind of... decorative?)
- `?` - docs (answering potential questions)
- `#` - code style and formatting (python comments symbol, that's often used for `# type - ignore`)

Adding `!` as a second char indicates the size of the changes. Not all commits are equals - eg squashed PRs can represent disproportional amount of changes, comparing to adding a feature as a new text input somewhere.

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
- settings - django settings.py

Scopes for the docs (`?`) type:
- refac
- glossary
- readme - either backend or frontend or root

### Commit style

Dropping verbs as "added"/"fixed"/etc is fine, as long as the respective colored `Type` UTF is used.

As long as human brain can read it - the shorter the better, regardless of the grammar.
Especially with dropping rudimentary/inconsistent English conventions, that don't exist in other languages, eg as prefixes "the/a/an".

But shortening into non-cognitively memorized words is bad, eg:
- `smth` - memorized, good
- `mgmt` - "management" - kind of ok, depending who the readers are
- `brwsr` - "browser" - bad, uncommon

Shortening is bad when sentence the brain usually perceives as a set of "token" is turned into a rare mix of single abbreviations, eg:

Bad
- ~(BE) imprv auth w/ opt JWT tkn & upd usr mgmt admn

Ok
- ~(BE) improve auth w optimized JWT token; cleanup user mgmt admin

In first line include the issue/PR ID at the end, to render as a clickable link in the IDE/github list view.

### Examples

- `+ ! (tags) sort by user #1260`
- `~ (tags) pagination of list view #1261`
- `~ (API) prefetch on QS lists #1262`

### Specs

For details see [conventionalcommits.org](https://www.conventionalcommits.org).
And [the Angular guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#type) that
I consider a fine example of implementing types/scopes. 

```
+ add required fields (+7) to ReviewCreateForm
+ add Sentry to settings.py
- try to patch PyCharm broken TS Lang service
- make ReviewCreateForm submittable
~ cleanup .run/ SDK
~ ! upgrade strwaberry
? specify colors in git-commits.md
```
