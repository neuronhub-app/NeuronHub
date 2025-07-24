## Client Caveats

- `react-select`: drops custom `Option` attributes - only keeps `value` and `label`
- `react-hook-form`: `onChange` breaks if you pass `ref` to `<input>` - see [docs](https://www.react-hook-form.com/faqs/#Howtosharerefusage)
- `react-router` v7: HMR force-reloads when `export default` Route component file changes
- `urql`: needs `{ requestPolicy: "network-only" }` in `reexecuteQuery` (urql#1395)

### GraphQL mutateAndRefetch

Each `mutation` triggers a [refetchAllQueries()](/client/src/urql/refetchQueriesExchange.ts) to reset cache. Causes a 1s
delay, ie no scaling problems. But its code has a small bug caused by react-router - it stops refetching if react-router
does forward/back navigation. But it's a good solution for the GraphQL caching hell that we're going to keep.
