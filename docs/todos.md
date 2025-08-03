---
reviewed_at: 2025.08.02
---

A plaintext format `todo <comment>` lead to over-saturation and eventual ignore by everybody.

Specify as `todo <prio>(<category>): <context>`

Example: `todo refac(auth): limit user access to other users`


`prio` values:
- `!!` - a must for prod deploy
- `!` - a must once the edge case becomes feasible in prod
- `feat` - a feature to add
- `refac` - significant, not urgent
- `prob` - a nice-to-have, "maybe", might never be needed

`category` values see in git-commits.md, + extra, eg:
- UX - an annoyance, real or potential
