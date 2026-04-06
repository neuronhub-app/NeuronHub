## Desc

We're refactoring the Job location facets in Algolia, FE and BE.

Initially `Job` had 4 fields:
- `tags_country`
- `tags_city`
- `is_remote`
- `is_remote_friendly`

But those have proven to be insufficient.

Later, another dev used an LLM to add `JobLocation` as a hot fix - it needs to be refactored.

We had 3 `useRefinementList` hooks on 1 `locations_facet`, but:
- broken UI `selected` state
- cross-facet hiding by `AND` filter

### Algolia-based solution by an LLM

An LLM implemented complete override of client processors in `client/src/utils/useAlgoliaSearchClient.ts` that obviously didn't work.

Now removed.

### Refactor

We're going to do a clean implementation instead of the one before.
- Django is going to return sorted `JobLocation`s by the RAM-cached `.count` of `Job` per each.
- FE will use standard string search to add `<mark>` & filter in `transformItems` on client-side Popover instead of Algolia overrides.
- The rest of Algolia UI stays same -> filters global state is managed by Algolia.
- The trash in `useAlgoliaSearchClient` is wiped.

Read the docs:
- Algolia.md
- docs/src/pages/development/guides/adding-job-alert-filters.mdx

Bad code:
- only `city` can be selected, and it's never marked as `checked`. The LLM justified it by migrations, but fresh CSV import disproves that.
- see others below.

Notes:
- `JobLocation` is the single source of truth. We've dropped `Job.is_remote`, `.is_remote_friendly`, `.tags_country`, `.tags_city`. Remains might be in NHA - but they don't matter right now.
- the dev env uses `VITE_SITE="pg"`. We'll create another ticket to migrate NHA `VITE_SITE=""` later.

In e2e take screenshots to see what your bugs look like. Make them small, focused on the elements you need to see. And with a delay to let the animations play out.

### Tasks
- [x] fix the Algolia count - show django `.count` only if a location filter is active. Otherwise show Algolia count.
    - right now if I select eg "Cause Area" -> the Locations count is unusable and forces me to check 20 cities before i can find the one that is matching
    - Add Red/Green e2e TDD to your Task list.


## Relevant-Files

Must read:
- `server/neuronhub/apps/jobs/models.py` :31-56 — `JobLocation` model, `LocationType` TextChoices, `algolia_filter_name` property
- `server/neuronhub/apps/jobs/graphql.py` :37-47 `JobLocationType` — exposes `type` + `algolia_filter_name`
- `server/neuronhub/apps/jobs/index.py` :93 — `locations.algolia_filter_name` facet attr
- `client/src/sites/pg/components/PgFacetLocation.tsx` — 3 instances share 1 `useRefinementList` attr, filters Django items by `type`
- `client/src/sites/pg/components/PgFacetPopover.tsx` :27-39 badge/clear — uses `attribute` prop for `useActiveFacetCount` and `useClearRefinements`
- `client/src/sites/pg/components/PgFiltersTopbar.tsx` — 3x `PgFacetLocation` with `LocationType` enum filter
- `client/src/graphql/fragments/jobs.ts` :24-33 — `JobFragment` locations sub-selection (must include `algolia_filter_name` for Algolia serialization)
- `client/src/apps/jobs/list/JobsSubscribeModal.tsx` — `getLocationIdsActive` matches refinements → `location_ids`

BE tests/stubs:
- `server/neuronhub/apps/jobs/graphql__test.py`
- `server/neuronhub/apps/jobs/services/csv_import.py` :170-225 — `_parse_location_field` now emits country entries
- `server/neuronhub/apps/jobs/services/csv_import__test.py`
- `server/neuronhub/apps/jobs/tests/db_stubs.py` :23-29 `LocationVal`, :788+ `val.location.*` with `_t` enum refs, country entries
- `server/neuronhub/apps/tests/test_gen.py` :490-535 `JobsGen.location()` — sets `type` via `defaults`

FE duplicates:
- `client/src/sites/pg/pages/jobs/list/JobsSubscribeModal.tsx` — PG duplicate, uses shared `getLocationIdsActive`
- `client/src/sites/pg/pages/jobs/list/JobList.tsx` :67-70 — `facetsActive.formatAttribute` strips `[type] ` prefix
- `client/src/sites/pg/components/PgAlgoliaFacetsActive.tsx` — renders active facet tags

E2E:
- `client/e2e/tests/job-location-facets.spec.ts`
- `client/e2e/tests/job-alert.spec.ts`

Migrations:
- `0036_joblocation_type` — adds `type` CharField
- `0037_backfill_joblocation_type` — backfills from `is_remote`/`city`
- `0038_alter_joblocation_type` — CharField → TextChoicesField

## Exec-Plan

BE + FE complete. Single `locations.algolia_filter_name` attr, 1 `useRefinementList` in PgFiltersTopbar, 3 typed `PgFacetLocation` popovers. Subscribe via `location_ids`. E2E passing.

## Decision-Log

- Refac: `locations.name` → `locations.algolia_filter_name` (regular facet)
    - 1 shared Algolia attr for cross-popover OR
    - 3 separate attrs rejected: InstantSearch ANDs across attrs
- `JobLocation.LocationType` as `TextChoicesField` + `@strawberry.enum`
    - Initially used CharField(choices=) → `auto` resolves as str
    - required enum in FE from codegen → TextChoicesField
    - Enum name `LocationType` (not `Type` — too generic for codegen)
- `algolia_filter_name` must be in `JobFragment` locations sub-selection
    - Without it `_get_graphql_field("locations")` omits it from
      Algolia indexed docs → facet filter returns 0 hits
- `aget_or_create` by `name` only, rest in `defaults`
    - `name` is unique constraint — natural lookup key
    - Prior: lookup by name+other fields caused stage db issues
- csv_import emits country-type entries per unique country
    - `seen_countries` set dedupes across multi-city same-country
- Refac: `job_alert_subscribe` accepts `location_ids: [Int!]`
    - Was: 3 string params + Q() matching
    - FE `getLocationIdsActive` matches refinements → IDs
- Fix: badge/clear cross-contamination → `activeFacetCount`/`onClear` props
- Fix: 3x `useRefinementList` conflict → single hook in PgFiltersTopbar
- Fix: `filterOnly` → regular facet attr (location counts were static)
    - PgFacetLocation: Algolia count default, Django `job_count` when refined
- Fix: XSS in `highlightMatch` — escape HTML before `<mark>`
- Prior decisions:
    - csv_import `aget_or_create` by name-only messed up stage db
    - `JobAlert.locations` M2M added, `_get_jobs_qs_by_alert` cleaned
    - circular dep PgLayout↔PgHeader => `pgLayoutStyle.ts`
