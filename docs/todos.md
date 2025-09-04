---
reviewed_at: 2025.09.03
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
- `refac-name` - renaming, specifically postponed as Git sucks at renaming history, ie to batch the history fuck-up to a chosen moment. 
- `perf` - performance, low to avoid premature optimizations
- `prob` - a nice-to-have, ie "maybe", ie might never be needed

`<scope>` values see in the [git commit Scopes](/docs/git-commits.md#Scopes), eg:
- `UX` - an annoyance, real or potential
