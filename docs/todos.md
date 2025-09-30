---
reviewed_at: 2025.09.03
---

## How to write TODO comments

The plaintext format `todo <explanation>` leads to over-saturation and eventual ignore by everybody.

Specify as `todo <prio>(<scope>)<:?> <explanation>`

Examples
- `todo refac(auth): access to other users`
- `todo ! drop #AI-slop`

`<prio>` values:
- `!!` - a must for commits on `master`
- `!` - a must, once the edge case becomes feasible in prod
- `feat` - feature
- `fix`
- `refac` - significant, not urgent
- `refac-name` - renaming, specifically postponed as Git sucks at renaming history, ie to batch the history fuck-up to a chosen moment. 
- `perf` - performance, low to avoid premature optimizations
- `prob` - a nice-to-have, ie "maybe", ie might never be needed

`<scope>` values see in the [git commit Scopes](/docs/git-commits.md#Scopes), eg:
- `UX` - an annoyance, real or potential
- `UI` - visual improvements
- `review`
