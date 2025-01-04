---
reviewed_at: 2025.01.03
---


Setup
--------------------------------

### Install

- bun install
- bun run dev

### Prod build

- bun run build
- bun run preview

### Upgrade

Using npm-check-updates.

- bun run check-update
- bun run upgrade

Caveats
--------------------------------

### chakra v3

Immature, esp in combination with React 19. Eg when React runs the magic `useMemo()`, Chakra components try to supply `JSON.stringify()`, but if the Component has a prop with a cycled ref, the `stringify()` is going to throw a recursion error (keywords: stateNode, FiberNode).

Some components, eg `SegmentControl`, have incorrect css that don't work without `ColorModeProvider`, hence it isn't feasible to remove it.

### zod.js

The internal are convoluted and have odd dependencies. Eg fields stop being required if tsconfig.json's `compilerOptions::strict=false`.

Generally plays badly with react-hook-form, especially with defaults (of any kind), and in particular `z.default()`.

`z.date()` has changed over the years, and quite new, doesn't appear to be reliable.

### react-select

Drops metadata outside of `Option.id` and `Option.label` eg it keeps trying to drop `TagOption.comment`.
