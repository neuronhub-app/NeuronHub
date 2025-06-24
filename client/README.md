---
reviewed_at: 2025.06.17
---

## Setup

```bash
bun install
bun run dev
```

**Upgrade**: `bun run update`  
**Formatting**: Biome JetBrains plugin on save

## GraphQL Pattern

**`mutateAndRefetch`** - each mutation triggers [`refetchAllQueries`](./src/urql/refetchQueriesExchange.ts) to avoid stale cache. Currently ~1 second delay, may need optimization as app scales.

## Development Notes

**react-router v7**: HMR hard-reloads on Route component changes - keep only route params in `index.tsx`

**urql**: `reexecuteQuery` needs `{ requestPolicy: "network-only" }` (urql#1395)

**react-hook-form**: `onChange` breaks if you pass `ref` to `<input>` - see [docs](https://www.react-hook-form.com/faqs/#Howtosharerefusage)

**Chakra v3**: React 19 conflicts with `useMemo()`/`JSON.stringify()` causing recursion (`stateNode`, `FiberNode` errors)

**Zod**: Affected by `tsconfig.json` strict mode, `z.date()` unstable, v4 upgrade planned

**react-select**: Drops custom `Option` props (only keeps `value`/`label`)
