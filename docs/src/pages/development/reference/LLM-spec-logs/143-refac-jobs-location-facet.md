## Desc

We're refactoring the Job location facets in Algolia, FE and BE.

Initially `Job` had 4 fields:
- `tags_country`
- `tags_city`
- `is_remote`
- `is_remote_friendly`

But those have proven to be insufficient.

Later, another dev used an LLM to add `JobLocation` as a hot fix. Most of the code relating to it need to be removed/restructured to stabilize the system.

At the moment we have 3 `useRefinementList` hooks on 1 `locations_facet` => broken selected state, cross-facet hiding, 600ms UI freeze on a facet click.

Read Algolia.md and other relevant docs. To understand the context better - also read the follow-up ticket `144-refac-jobs-locations-by-dropping-redundant-bool-field.md`.

Note: the current env uses `VITE_SITE="pg"` - that's ok, work on its FE first. Then we'll create another ticket to migrate `VITE_SITE=""`.

### Checklist

- [x] LLM: implementation
- [x] LLM: review specs
- [x] LLM: review correctness v0
- [x] LLM: review style
- [x] LLM: review specs v1
- [x] review LLM code
    - [x] fixes
- [x] LLM: review correctness v1
    - [x] fixes

### Plan by an LLM

3 separate Algolia facet attributes (`locations_remote`,
`locations_country`, `locations_city`). Each gets a standard
independent `useRefinementList` + popover. Cross-attribute OR
via search client interceptor (~15 lines, rewrites `facetFilters`
before hitting Algolia API).

`JobLocation` is the single source of truth. Drop `Job.is_remote`,
`Job.is_remote_friendly`, `Job.tags_country`, `Job.tags_city`.


#### 1. Backend: consolidate onto JobLocation

- Drop `Job.is_remote`, `Job.is_remote_friendly` fields
  - `send_job_alerts.py`: `qs.filter(is_remote=True)`
    => `qs.filter(locations__is_remote=True)`
  - `csv_import.py`: drop `job["is_remote"]` write
    (JobLocation records already carry `is_remote`)
  - `admin.py`: remove from `list_display`, `fieldsets`
  - `serialize_to_md.py`: derive from `job.locations`
  - `test_gen.py`: drop `is_remote` param, use locations
- Drop `Job.tags_country`, `Job.tags_city` M2M fields
  - Remove from `tag_fields` in index.py
  - Remove from `searchableAttributes`
  - Remove from `prefetch_related` in index.py
  - Remove from `JobFragment` in jobs.ts
  - Remove from `attributesToHighlight` in JobList.tsx
- Drop `JobAlert.is_remote` (0 value in existing DB)
  - `send_job_alerts.py`: remove `is_remote` filter + summary
  - `graphql.py`: remove from mutation + type
  - FE: remove from subscribe modals + alert list display
- Migration: remove fields

#### 2. Backend: 3 Algolia facet attributes

[done] Implemented as nested faceting on `locations` JSON field:
`locations.remote_name`, `locations.country`, `locations.city`.
See `index.py` and `graphql.py` in Relevant-Files.

#### 3. FE: search client interceptor

[done] `wrapClientWithLocationInterceptor` in
`useAlgoliaSearchClient.ts`. Attrs: `locations.remote_name`,
`.country`, `.city`. Wraps `search()` + `searchForFacets()`.
Remaining: type it + add freeze (see Exec-Plan).

#### 4. FE: 3 independent popovers

[done] `PgFiltersTopbar.tsx` — `RemoteFacet`, `CountryFacet`,
`CityFacet` with `operator="or"` on nested attrs.

#### 5. FE: cleanup

- Delete `locations.ts` (415 lines)
- Delete `allowedValues` prop + synthetic count=0 injection
  from `PgFacetAttribute`
- `JobFragment`: drop `is_remote`, `is_remote_friendly`,
  `tags_country`, `tags_city`. Keep `locations { ... }`
- `JobCard`: already uses `job.locations` for display — keep
- `JobList.tsx`: update `labelsOverride` for new attributes
- `JobsSubscribeModal`: detect remote from
  `locations_remote` refinements instead of `locationRemoteNames`
- Old site (`apps/jobs/`): migrate `is_remote` facet to
  `locations_remote`, `tags_country/city` to new attributes
- `PgJobAlertList`: drop `alert.is_remote` display

## Relevant-Files

### FE — the interceptor (all remaining work is here)

- `client/src/utils/useAlgoliaSearchClient.ts` - `rewriteSearchParams` + `rewriteLocationFilters`
- `client/src/sites/pg/components/PgFiltersTopbar.tsx` - 3 location popovers with `operator="or"`
- `client/src/sites/pg/components/PgFacetAttribute.tsx` - `useRefinementList`, renders count via `<Text>{item.count}</Text>`

### E2E

- `client/e2e/tests/job-location-facets.spec.ts` - test 4 RED (1-attr `londonCountBefore`), needs freeze
- `client/e2e/ids.ts` - `ids.facet.checkbox()` fn
- `server/neuronhub/apps/jobs/tests/db_stubs.py` - stub data: Kenya=BridgeFund only, Berkeley=Arclight only, London=6 jobs

### BE — subscriptions (locations M2M)

- `server/neuronhub/apps/jobs/models.py` - `JobAlert.locations` M2M
- `server/neuronhub/apps/jobs/graphql.py` - `JobAlertType.locations`, `job_alert_subscribe(location_names)`
- `server/neuronhub/apps/jobs/services/send_job_alerts.py` - `_get_jobs_qs_by_alert` filters by `alert.locations`, dropped dead `tags_country`/`tags_city`
- `server/neuronhub/apps/jobs/services/send_job_alerts__test.py` - `test_matches_by_location`, `test_matches_by_multiple_locations`
- `server/neuronhub/apps/jobs/migrations/0028_jobalert_locations.py`

### BE (done, for context only)

- `server/neuronhub/apps/jobs/index.py` - nested faceting: `locations.remote_name`, `.country`, `.city`
- `server/neuronhub/apps/jobs/graphql.py` - `JobLocationType.remote_name` resolver

## Exec-Plan

### Done

1. Typed interceptor: `LegacySearchMethodProps`,
   `SearchMethodParams`, `SearchParamsObject` — no `any`/`biome-ignore`
2. Freeze: `isFreezeTotalFacetCount` prop in `PgFacetAttribute` →
   `FacetCheckboxItem` caches count via `useClearRefinements` on
   first unfiltered response. Passed to 3 location facets in
   `PgFiltersTopbar`.
3. Merge 2+ location groups → OR kept.

NHA site (`apps/jobs/`) still uses `is_remote` facet attr
(deferred per Desc: "VITE_SITE='pg'" first)

## Decision-Log

- fix LLM plan §2-4 of flat attrs => nested faceting (`locations.country`, `.city`, `.remote_name`)
    - `remote_name`: computed on `JobLocationType` -> `name if remote else ""`
- §1 "Drop `JobAlert.is_remote`" => kept for NHA compat
- Fix: csv_import `aget_or_create` w/o city/country/is_remote
  => `ParsedLocation` dataclass, defaults on create
- Follow-up #144: `JobLocation` 5 fields → 4
- Fix: `rewriteSearchParams` expected v5 `{requests:[]}`,
  instantsearch sends legacy `[{indexName, params:{facetFilters}}]`
- Facet counts AND'd in disjunctive queries
    - Tried: detect disjunctive by `hitsPerPage===0` => no match
    - Tried: detect by `facets` only-location-attrs => no match
    - Tried: count-based (strip 1-group when batch ≥2) => works
      only after 2nd attr click, not prior
    - Fix: `typeof facets === "string"` detects disjunctive
      (main=array, disjunctive=string in legacy format).
      Strip location filters from location disjunctives.
      Dropped `countLocationAttrsInBatch`.
- 1-attr case: no disjunctive query for unrefined attrs,
  counts come from AND'd main query
    - Tried: inject extra queries + merge response
      => reverted, trash code
    - Tried: custom connector `useLocationFacetGroup`
      => ~300 LOC reimplementing `useRefinementList`
    - Fix: freeze location counts from first response
      (no location filters), overwrite on subsequent.
      If URL has filters on load → hide counts until can save from empty URL.
- Type interceptor: `algoliasearch/lite` exports all types,
  drop `any`/`biome-ignore`
- Freeze approach: interceptor-level response caching too complex
  (async, generic types, response shape varies). Moved to
  `PgFacetAttribute` via `isFreezeTotalFacetCount` +
  `useClearRefinements().canRefine` to detect unfiltered state
- `JobAlert` had no `locations` M2M => subscriptions ignored location facets
    - Added `JobAlert.locations` M2M, `job_alert_subscribe(location_names)`
    - `_get_jobs_qs_by_alert` referenced dead `tags_country`/`tags_city` => removed
    - Renamed `test_matches_by_remote_location` => `test_matches_by_remote_via_is_remote_flag`
    - Added `test_matches_by_location`, `test_matches_by_multiple_locations`
    - FE: both modals send `location_names` from location refinements
    - FE: both alert lists display `locations` badges
