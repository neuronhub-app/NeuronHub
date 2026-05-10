## Desc

We're fixing db overload on PG.

The `JobsByIds` query has been inherited from `posts` that's not used on PG. And Algolia can store 98% of GraphQL JSON. 

Next step is eg inserting `SiteConfig` at FE build time - as wo/ `SiteConfig` PG can't finish loading.

### Tasks
- [x] drop the `JobsByIds` query from PG homepage
- [x] code review

## Relevant-Files

- `client/src/sites/pg/pages/jobs/list/JobList.tsx` — drop `hits.enrichment`; keep `JobsByIdsQuery` const (BE Algolia indexer needs it in whitelist)
- `client/src/sites/pg/components/PgAlgoliaInfiniteHits.tsx` — drop `enrichment` + `useAlgoliaEnrichmentByGraphql` import (PG was sole consumer)
- `client/src/sites/pg/components/PgAlgoliaList.tsx` — drop `TData` generic (no longer threaded through)
- `client/src/graphql/fragments/jobs.ts` — drop deprecated `url_external_with_utm`, unused `is_published`
- `client/src/sites/pg/pages/jobs/list/JobCard.tsx` — drop `url_external_with_utm` fallback
- `server/neuronhub/apps/jobs/index.py` — `JobIndex` lifted out of `IS_ENABLED` guard (signal registration stays guarded) so tests can import
- `server/neuronhub/apps/jobs/index__test.py` — contract: `paths(JobsByIds GraphQL) ⊆ paths(JobIndex.get_raw_record)`

## Exec-Plan

Done. Contract test green; `mise lint` regenerated `persisted-queries.json` with trimmed fragment; full `apps/jobs/` pytest passing (62 tests).

## Decision-Log

- chosen: stop executing `JobsByIds` on PG; keep persisted-query def
    - type-safety hole: PG renders Algolia JSON cast as `JobFragmentType` w/o GraphQL merge → drift = silent fail. Mitigation: `index__test.py` leaf-paths contract.
- BE: `JobIndex` lifted out of `if IS_ENABLED` guard; `register(Job, JobIndex)` stays guarded
    - tradeoff: `from algoliasearch_django import AlgoliaIndex` now unconditional (worked under `dev_test_unit` env where pkg not in INSTALLED_APPS - import-only is benign)
- removed `url_external_with_utm` (deprecated; `appendUtmSource()` covers via SiteConfig.jobs_url_utm_source) + `is_published` (unused on FE) from `JobFragment` per CTO
