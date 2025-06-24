---
reviewed_at: 2025.06.22
---

## Client Setup

```bash
bun install
bun run dev
```

Upgrade all using `npm-check-updates` - `bun run update`  

### Notes

#### GraphQL Pattern

`mutateAndRefetch` - each mutation triggers [`refetchAllQueries`](./src/urql/refetchQueriesExchange.ts) to avoid stale cache. Currently ~1 second delay, highly unlikely to need optimization as app scales.

#### Misc

- react-router v7: HMR hard-reloads on Route component changes - keep only route params in `index.tsx`
- urql: `reexecuteQuery` needs `{ requestPolicy: "network-only" }` (urql#1395)
- react-hook-form: `onChange` breaks if you pass `ref` to `<input>` - see [docs](https://www.react-hook-form.com/faqs/#Howtosharerefusage)
- Chakra v3: React 19 conflicts with `useMemo()`/`JSON.stringify()` causing recursion (`stateNode`, `FiberNode` errors)
- Zod: Affected by `tsconfig.json` strict mode
- react-select: Drops custom `Option` props - only keeps `value` and `label`
