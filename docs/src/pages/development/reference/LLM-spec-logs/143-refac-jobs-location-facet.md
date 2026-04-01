## Desc

We're refactoring the Job location facets in Algolia, FE and BE.

Initially `Job` had 4 fields:
- `tags_country`
- `tags_city`
- `is_remote`
- `is_remote_friendly`

But those have proven to be insufficient.

Later, another dev used an LLM to add `JobLocation` as a hot fix - it needs to be refactored.

We have 3 `useRefinementList` hooks on 1 `locations_facet`, but:
- broken UI `selected` state
- cross-facet hiding by `AND` filter
- 600ms UI freeze on a facet click

Read the docs:
- Algolia.md
- the follow-up ticket `144-refac-jobs-locations-by-dropping-redundant-bool-field.md`

### Tasks
- [x] fix location `location.city` saving to form FE to FE

### Ticket Checklist

- [x] LLM: review correctness
- [x] LLM: review style
- [x] LLM: review specs
- [x] review code + fixes
- [x] LLM: review correctness

### Plan

- 3 separate facet attributes: `locations.remote_name`, `locations.country`, `locations.city` (JSON is stored in Algolia)
- Each field uses an `useRefinementList` + `<Popover>`.
- `OR` via `searchClient` interceptor (rewrites `facetFilters` pre Algolia API).

Notes:
- `JobLocation` is the single source of truth. Drop `Job.is_remote`, `.is_remote_friendly`, `.tags_country`, `.tags_city`.
- the dev env uses `VITE_SITE="pg"`. We'll create another ticket to migrate NHA `VITE_SITE=""`.

#### 1. Backend: consolidate onto JobLocation

[done] Model fields `Job.is_remote`, `.is_remote_friendly`, `.tags_country`, `.tags_city` dropped (migration 0027).

- Drop `JobAlert.is_remote` => deferred to #144
      - `send_job_alerts`: `is_remote` filter + summary
      - `graphql.py`: mutation + type
      - FE: drop from subscribe modals + alert list display

#### 2. Backend: 3 Algolia facet attributes

[done] Implemented as nested faceting on `locations` JSON field: `.remote_name`, `.country`, `.city`.
See `index.py` and `graphql.py`.

#### 3. FE: search client interceptor

[done] `wrapClientWithLocationInterceptor` in
`useAlgoliaSearchClient.ts`. Attrs: `locations.remote_name`,
`.country`, `.city`. Wraps `search()` + `searchForFacets()`.
Remaining: type it + add freeze (see Exec-Plan).

#### 4. FE: 3 independent popovers

[done] `PgFiltersTopbar.tsx` - `RemoteFacet`, `CountryFacet`,
`CityFacet` with `operator="or"` on nested attrs.

#### 5. FE: cleanup

[done] `locations.ts` deleted, `allowedValues` prop removed, `JobFragment` clean, `JobCard` uses `job.locations`.

Remaining (deferred to #144):
- `JobAlertList.tsx`: displays `alert.is_remote` => drop with field
- `PgJobAlertList.tsx`: same

## Relevant-Files

FE - subscribe modals
- `client/src/sites/pg/pages/jobs/list/JobsSubscribeModal.tsx` - PG modal
- `client/src/apps/jobs/list/JobsSubscribeModal.tsx` - NHA modal, `is_remote` now from `locations.remote_name`

FE - NHA facets
- `client/src/apps/jobs/list/JobList.tsx` - `is_remote` => `locations.remote_name` attr facet

FE - facet popovers
- `client/src/sites/pg/components/PgFacetPopover.tsx` - trigger now `Box` (not `Button as="div"`) for `data-testid` compat
- `client/src/sites/pg/components/PgFiltersTopbar.tsx` - sets `testId` on location popovers

E2E
- `client/e2e/tests/job-location-facets.spec.ts` - cross-facet OR + subscribe param assertion
- `client/e2e/ids.ts` - `ids.facet.popover.{remote,country,city}`

BE
- `server/neuronhub/apps/jobs/graphql.py` - `job_alert_subscribe(location_countries, location_cities, location_remote_names)`
- `server/neuronhub/apps/jobs/graphql__test.py` - 5 tests for typed location params
- `server/neuronhub/apps/tests/test_gen.py` - `Gen.location()`: fixed `city=None` and missing `is_remote`

## Exec-Plan

All site work done. Remaining tracked in #144:
- Drop `JobAlert.is_remote` field + all consumers (alert lists, send_job_alerts)
- Drop `JobLocation.name` => computed `label`
- `index.py`: drop `locations.name` attr (redundant after #144 `name` drop)

## Decision-Log

- Nested faceting (`locations.country`, `.city`, `.remote_name`) instead of LLM's flat attrs
    - `remote_name`: computed on `JobLocationType` => `name if remote else ""`
- `JobAlert.is_remote` kept for NHA compat => deferred to #144
- `JobAlert.locations` M2M added for typed alert-location binding
- Algolia facets are flat `{value: count}` — no IDs available
    - Tried: `refinesCurrent.items`, `results.hits`, `locations.id` facet, `_rawResults` => all flat
    - Fix: typed string params (`location_countries`, `_cities`, `_remote_names`), BE resolves via `Q()` filter
    - Tradeoff: matches ALL rows for field value (eg country="Kenya"). Unique constraint planned.
- Fix: `rewriteSearchParams` expected v5 format, instantsearch sends legacy `[{indexName, params}]`
- Fix: `typeof facets === "string"` to detect disjunctive queries (count AND issue)
- PgFacetPopover: `Button as="div"` => `Box` — Chakra strips `data-testid` via `asChild`
- E2E: `.getByTestId(id).last()` — mobile layout duplicates testids
- `index.py` still has `locations.name` facet — needed until #144 drops `name` field
- NHA `JobList.tsx`: `AlgoliaFacetBoolean is_remote` => `AlgoliaFacetAttribute locations.remote_name`
- NHA `JobsSubscribeModal.tsx`: `is_remote` derivation from dead `"is_remote"` attr => `"locations.remote_name"`
- `graphql__test.py`: 5 LLM-slop tests => 1 mixed test (covers all 3 Q() branches + OR)
