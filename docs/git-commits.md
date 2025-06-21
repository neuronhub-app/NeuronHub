---
reviewed_at: 2025.06.20
---

The project is using a symbol-based iteration over the [conventionalcommits.org](https://www.conventionalcommits.org).

Examples:
- `+ add required fields (+7) to ReviewCreateForm`
+ `+ [monitor] Sentry to settings.py`
- `~ [tags] pagination of list view #1261`
- `+ ! [tags] sort by user #1260`
- `~ [API] prefetch on QS lists #1262`
- `? [git-commits] scopes`


### Type

- `+` - features (additions)
- `-` - bug fixes and reverts/removals
- `~` - refactor, cleanups, perf, etc (no intentional changes, additions/deletions, hence `~`)
- `=` - tests (stability improvements that should be unable to damage anything runtime related, hence the double horizontal line)
- `^` - CI, dependencies, compiler configs, etc (improvements of deploy, hence the arrow up)
- `@` - visual-only changes, eg in `client/`, most often no code review needed (no better idea than `@`, since it's kind of... decorative?)
- `?` - docs (answering potential questions)
- `#` - code style and formatting (python comments symbol, that's often used for `# type - ignore`)

A second char `!` can be added to indicate the importance of the changes. Eg squashed PRs can contain dozens KLOC, vs adding a new text input.

The commit can be ended in `(AI)` to indicate that most of the code was LLM written, and didn't receive an overly scrupulous code-review, ie can contain perfectly hidden bugs.

### Scopes

- `API` - backend & strawberry types, mutations, etc. Usually without `clients/` changes.
- `upgrade` - devops `^` upgrading. Done often and usually has no changes outside lock-files.
- `auth` - apps.users or frontend logic for it, hijacking, permissions, etc
- `tags` - related to FE or BE tags implementation
- `AI` - tools as Claude, Aider, etc
- `admin` - django admin related
- `types` - TypeScript or Python typings
- `monitor` - sentry, datadog, etc

Not used atm:
- `brows` - browser extension
- `track` - PostHog or other changes re analytics and activity tracking

Scopes for the docs (`?`) type:
- `refac`
- `glossary`
- `arch` - for [architecture.md](/docs/architecture.md) file
- `readme` - either backend or frontend or root
- `{file name without "md"}`

### Commit style

Dropping verbs as "added"/"fixed"/etc is fine, as long as the respective `Type` UTF is used.

As long as human brain can read it - the shorter the better, regardless of the grammar.
Especially with dropping rudimentary/inconsistent English conventions, that don't exist in other languages, eg as prefixes "the/a/an".

But shortening into non-cognitively memorized words is bad, eg:
- `smth` - memorized, good
- `mgmt` - "management" - kind of ok, depending who the readers are
- `brwsr` - "browser" - bad, uncommon

Shortening is bad when sentence the brain usually perceives as a set of "token" is turned into a rare mix of single abbreviations, eg:

Bad
- `~ imprv auth w/ opt JWT tkn & upd usr mgmt admn`

Ok
- `~[auth] improve by optimized JWT token; cleanup user mgmt admin`

In first line include the issue/PR ID at the end, to render as a clickable link in the IDE/github list view.

### Notes

Emojis aren't used due to the cognitive overhead in inconsistent 3D style. The aim is plaintext, that can be colored by the end-user GUI/TUI eg with regexes.

For details see [conventionalcommits.org](https://www.conventionalcommits.org).
And [the Angular guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#type) that
I consider a fine example of implementing types/scopes. 
