Prerender + prefetch is build-time static HTML - no Node runtime.

Used by `JobsLandingPage(Model)` pages `/{slug}`: SEO needs real `<title>` / `<meta>` / `<h1>` before JS hydrates.

## Pipeline

1. `mise client:prefetch-from-server` — runs `[[client/src/prefetch/runPrefetch.ts]]`. POSTs the `JobsLandingPagesForPrefetch` query (def for whitelist via [[client/src/prefetch/JobsLandingPage.ts]]) and writes `client/graphql/prefetch/JobsLandingPages.json` (gitignored).
2. `react-router build`: `react-router.config.ts` reads the JSON and emits one HTML file per `/{slug}`.
3. `[slug].tsx` — static import + runtime load of JSON; the entry for prerender.

`env.mode.isSSR` / `env.mode.isClient` used in Apollo `client.query` boot, `localStorage`, `posthog.init`, etc.

## SEO meta

`[[useHeadMeta.tsx]]` — keyed by `location.pathname`. Render-time writes (not `useEffect`) so prerender emits the override. Root renders `<headMeta.Hoisted />`.

Why not react-router's native `<title>`: its API emits two `<title>` tags during prerender (default + override) → breaks Playwright strict locator and OG-first crawlers.

## Adding a new prerendered list

#AI

1. New query in `client/src/prefetch/{Name}.ts`, registered via `graphql.persisted`.
2. Extend `runPrefetch.ts` to fetch + write a sibling JSON.
3. Wire JSON into `react-router.config.ts::prerender`.
4. New route handler that imports the JSON for static + client lookup.
5. `useHeadMeta()` in the route for SEO.
6. e2e self-creates the JSON in `beforeEach` (file is gitignored).
