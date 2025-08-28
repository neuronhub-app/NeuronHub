---
reviewed_at: 2025.08.28
---

## How to write TODO comments

The plaintext format `todo <explanation>` leads to over-saturation and eventual ignore by everybody.

Specify as `todo <prio>(<scope>): <explanation>`

Example: `todo refac(auth): limit user access to other users`

`<prio>` values:
- `!!` - a must for commits on `master`
- `!` - a must, once the edge case becomes feasible in prod
- `feat` - feature
- `refac` - significant, not urgent
- `prob` - a nice-to-have, ie "maybe", ie might never be needed

`<scope>` values see in the [git commit Scopes](/docs/git-commits.md#Scopes), eg:
- `UX` - an annoyance, real or potential
