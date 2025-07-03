# Client Caveats

- `urql`: needs `{ requestPolicy: "network-only" }` in `reexecuteQuery` (urql#1395)
- `react-hook-form`: `onChange` breaks if you pass `ref` to `<input>` - see [docs](https://www.react-hook-form.com/faqs/#Howtosharerefusage)
- `chakra-ui` v3: React 19 can break its `useMemo()`/`JSON.stringify()` causing recursion (error keywords: `stateNode`, `FiberNode`)
- `react-select`: drops custom `Option` attributes - only keeps `value` and `label`
- `react-router` v7: HMR force-reloads when `export default` Route component file changes

### GraphQL mutateAndRefetch

Each `mutation` triggers a [refetchAllQueries()](/client/src/urql/refetchQueriesExchange.ts) to reset cache. Causes a 1s delay, ie no scaling problems. But its code has a bug atm - breaks on page forward/back navigation.
