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
- [x] Find out why searching Country/City doesn't hide the non-matched values.

### Ticket Checklist

- [x] LLM: review correctness
- [x] LLM: review style
- [x] LLM: review specs
- [x] review code + fixes
- [x] LLM: review correctness

### Plan

- 3 separate facet attributes: `locations_remote`, `locations_country`, `locations_city`.
- Each field uses an `useRefinementList` + `<Popover>`.
- `OR` via `searchClient` interceptor (rewrites `facetFilters` pre Algolia API).

Notes:
- `JobLocation` is the single source of truth. Drop `Job.is_remote`, `.is_remote_friendly`, `.tags_country`, `.tags_city`.
- the dev env uses `VITE_SITE="pg"`. We'll create another ticket to migrate NHA `VITE_SITE=""`.

#### 1. Backend: consolidate onto JobLocation

- Drop `.is_remote`, `.is_remote_friendly`:
      - `send_job_alerts.py`: `qs.filter(is_remote=True)` => `qs.filter(locations__is_remote=True)`
      - `csv_import.py`: `job["is_remote"]` write (JobLocation records already carry `is_remote`)
      - `admin.py`: `list_display`, `fieldsets`
      - `serialize_to_md.py`: derive from `.locations`
      - `test_gen.py`: `is_remote` param -> use JobLocations
- Drop `.tags_country`, `.tags_city`:
    - `tag_fields` in index.py
    - `searchableAttributes`
    - `prefetch_related` in index.py
    - `JobFragment` in jobs.ts
    - `attributesToHighlight` in JobList.tsx
- Drop `JobAlert.is_remote`:
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

- Delete `locations.ts` (415 lines)
- Delete `allowedValues` prop + synthetic count=0 injection
  from `PgFacetAttribute`
- `JobFragment`: drop `is_remote`, `is_remote_friendly`,
  `tags_country`, `tags_city`. Keep `locations { ... }`
- `JobCard`: already uses `job.locations` for display - keep
- `JobList.tsx`: update `labelsOverride` for new attributes
- `JobsSubscribeModal`: detect remote from
  `locations_remote` refinements instead of `locationRemoteNames`
- Old site (`apps/jobs/`): migrate `is_remote` facet to
  `locations_remote`, `tags_country/city` to new attributes
- `PgJobAlertList`: drop `alert.is_remote` display

## Relevant-Files

FE - the interceptor (all remaining work is here)
- `client/src/utils/useAlgoliaSearchClient.ts`
- `client/src/sites/pg/components/PgFiltersTopbar.tsx`
- `client/src/sites/pg/components/PgFacetAttribute.tsx` - `useRefinementList`

E2E
- `client/e2e/tests/job-location-facets.spec.ts` - test 4 RED (1-attr `londonCountBefore`), needs freeze
- `client/e2e/ids.ts` - `ids.facet.checkbox()` fn
- `server/neuronhub/apps/jobs/tests/db_stubs.py` - stub data: Kenya=BridgeFund only, Berkeley=Arclight only, London=6 jobs

BE - subscriptions (locations M2M)
- `server/neuronhub/apps/jobs/models.py`
- `server/neuronhub/apps/jobs/graphql.py`
- `server/neuronhub/apps/jobs/services/send_job_alerts.py`
- `server/neuronhub/apps/jobs/services/send_job_alerts__test.py`

BE
- `server/neuronhub/apps/jobs/index.py`
- `server/neuronhub/apps/jobs/graphql.py`

## Exec-Plan

### Done

- `props.isFreezeTotalFacetCount` in `PgFacetAttribute` → `FacetCheckboxItem` caches count via `useClearRefinements` on first unfiltered response.
- NHA site uses `is_remote` - deferred.
- Facet search: skip `facetValuesInitialRef` merge when `searchQueryRef.current` is set.
- `PgFacetPopover.attributes` + `useCurrentRefinements` → gray `(N)` count badge.

## Decision-Log

- fix LLM plan §2-4 of flat attrs => nested faceting (`locations.country`, `.city`, `.remote_name`)
    - `remote_name`: computed on `JobLocationType` -> `name if remote else ""`
- §1 "Drop `JobAlert.is_remote`" => kept for NHA compat
- Fix: csv_import `aget_or_create` w/o city/country/is_remote => `ParsedLocation` dataclass, defaults on create
  [get_or_create by name-only isn't intuitive, and messed up the stage db by fetching JobLocation with empty fields. Reverted.]
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
- `JobAlert` had no `locations` M2M => subscriptions ignored location facets
    - Added `JobAlert.locations` M2M, `job_alert_subscribe(location_names)`
    - `_get_jobs_qs_by_alert` referenced dead `tags_country`/`tags_city` => removed
    - Renamed `test_matches_by_remote_location` => `test_matches_by_remote_via_is_remote_flag`
    - Added `test_matches_by_location`, `test_matches_by_multiple_locations`
    - FE: both modals send `location_names` from location refinements
    - FE: both alert lists display `locations` badges
- Fix facet search - skip `props.transformItems` if facet search is active
