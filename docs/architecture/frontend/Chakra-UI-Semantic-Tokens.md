---
paths:
  - "**/*.tsx"
  - "**/client/src/theme/*"
---

### Semantic Tokens

Always use semantic tokens when available. Create new tokens if helps in `client/src/theme/*`.

Without tokens the styles become an unmanageable clusterfuck.

For spaces always `gap.{token}` - our spacing is symmetrical. Add new ones if helps, or create aliases for the existing skeleton.

For colors always use the adaptable tokens (eg `bg="bg.subtle"`, not `black`), because we support light and dark mode natively.

To get the raw values use the `system` from `theme.ts`, eg `system.token("colors.danager")`. Or chakra v3 syntax it'll compile from any string, eg `"{colors.red}"`.

`mise lint` will re-generate Chakra theme types and tokens to lint them.
