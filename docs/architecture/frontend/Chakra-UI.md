---
paths:
  - "**/*.tsx"
  - "**/client/src/theme/*"
---

### Styles

We must avoid implicit dependencies in styling: if one part of a Component (or a page) uses the same gap/font/size/color for the symmetry or information hierarchy - it must have either a local `const style`, or a page-shared `export const style`, eg:

```ts
const style = {
  breakpoint: {
    lg: "xl",
    xl: "2xl",
  },
  padding: "gap.md",
  label: {
    color: "fg",
    fontSize: "xs",
    fontWeight: "bold",
  },
  zIndex: {
    user: 1,
    userAvatar: 2,
  },
} as const;
```

Then you can spread them as props as `<Box {...style.label}>`.

### Semantic Tokens

Always use semantic tokens when available. Create new tokens if helps in `client/src/theme/*`.

Without tokens the styles become an unmanageable clusterfuck.

For spaces always `gap.{token}` - our spacing is symmetrical. Add new ones if helps, or create aliases for the existing skeleton. The values at the moment: gap.xs, sm, sm2, md, md2, lg, xl - those are WIP and will be restructured later, ie it's ok to deviate from `gap` when it isn't an implicit dependency, eg for `gap="1"`.

For colors always use the adaptable tokens (eg `bg="bg.subtle"`, not `black`), because we support the light and dark modes.

To get the raw values use the `system` from `theme.ts`, eg `system.token("colors.danager")`. Or chakra v3 syntax - it'll compile from any string, eg `"{colors.red.500}"`.

`mise lint` regenerates Chakra theme types for tokens, variants, etc.
