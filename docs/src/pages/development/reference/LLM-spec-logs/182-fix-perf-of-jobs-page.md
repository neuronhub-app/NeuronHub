## Desc

We're fixing db overload on PG.

The `JobsByIds` query has been inherited from `posts` that's not used on PG. And Algolia can store 98% of GraphQL JSON. 

Next step is eg inserting `SiteConfig` at FE build time - as wo/ `SiteConfig` PG can't finish loading.

### Tasks
- [x] drop the `JobsByIds` query from PG homepage
- [x] code review
- [x] fix salary_min (or salary_text) showing `0` on JobCard when none is set

## Relevant-Files

- `client/src/sites/pg/pages/jobs/list/JobList.tsx` — drop `hits.enrichment`; keep `JobsByIdsQuery` const (BE Algolia indexer needs it in whitelist)
- `client/src/sites/pg/components/PgAlgoliaInfiniteHits.tsx` — drop `enrichment` + `useAlgoliaEnrichmentByGraphql` import (PG was sole consumer)
- `client/src/sites/pg/components/PgAlgoliaList.tsx` — drop `TData` generic (no longer threaded through)
- `client/src/graphql/fragments/jobs.ts` — drop deprecated `url_external_with_utm`, unused `is_published`
- `client/src/sites/pg/pages/jobs/list/JobCard.tsx` — drop `url_external_with_utm` fallback; coerce salary check to bool so JSX doesn't render literal `0`
- `server/neuronhub/apps/jobs/index.py` — `JobIndex` lifted out of `IS_ENABLED` guard (signal registration stays guarded) so tests can import
- `server/neuronhub/apps/jobs/index__test.py` — contract: `paths(JobsByIds GraphQL) ⊆ paths(JobIndex.get_raw_record)`

## Exec-Plan

Done. Contract test + new salary e2e green; `mise lint` clean; `apps/jobs/` pytest green (62).

## Decision-Log

### drop JobsByIds on PG
- chosen: stop executing; keep persisted-query def
    - type-safety hole: PG renders Algolia JSON cast as `JobFragmentType` w/o GraphQL merge → drift = silent fail. Mitigation: `index__test.py` leaf-paths contract.
- BE: `JobIndex` lifted out of `if IS_ENABLED` guard; `register(Job, JobIndex)` stays guarded
    - tradeoff: `AlgoliaIndex` import now unconditional (benign under `dev_test_unit`)
- removed `url_external_with_utm` (deprecated, `appendUtmSource()` covers) + `is_published` (unused on FE) from `JobFragment` per CTO

### salary `0` on JobCard
- root cause: Algolia's `get_salary_min_or_zero` returns `0` (vs GraphQL `null`); JSX renders `(salary_text || salary_min) && <Stack/>` → `0` as literal text.
- chosen: FE coerce to bool `(!!salary_text || !!salary_min)` — minimal diff
    - tried BE return `None`: rejected — Algolia facet `salary_min > 0` filter relies on numeric `0`
