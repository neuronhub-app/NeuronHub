---
description: How to interpret our TODO comments syntax.
reviewed_at: 2026.01.14
---

The classic `todo <task>` leads to over-saturation and perceptual blindness.

Our format: `todo <prio> <type><(scope)?>: <task?> <tags?>`

Examples
- `todo !!! fix(sec): access to other users`
- `todo ? refac: #AI-slop`

`<prio>` values:
- `!!!` - a must for prod or `master`
- `!!` - a must once it becomes relevant in prod
- `!` - needed, but not now
- `?` - a nice-to-have, might never be needed

`<type>` see the [Git commit Types](/docs/git-commits.md#types)

`<scope>` see the [Git commit Scopes](/docs/git-commits.md#scopes). For `todo` we have few extras:
- `refac-name` - renaming, postponed as Git log lacks file diff, ie to do separate commits.
- `UX` - an annoyance, real or potential
- `review`

`<tags>` see the [code-style.md Tags](/docs/code-style.md#tags).
