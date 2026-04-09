## Desc

The PG client asked to add a handle of url param `?source=AIM` -> on it show the job hits from Algolia that filters based on this `source` column in `.local/jobs.csv`.

Do not read more than 5 lines from CSV, including from python CSV queries.

I don't think we're importing this column - hence we need to add it to Algolia facets and db, eg as `Job.source_ext: CharField`.

The UI access in any filters is not needed, but it needs to be resettable by "Clear all" button - ie it must be detected as an active filter.

## Relevant-Files

- `server/neuronhub/apps/jobs/models.py` — `Job.SourceExt` TextChoices + `TextChoicesField`
- `server/neuronhub/apps/jobs/index.py` — `source_ext` in Algolia fields + facets
- `server/neuronhub/apps/jobs/services/csv_import.py` — `_parse_jobs_csv` + `_import_jobs_parsed`
- `server/neuronhub/apps/jobs/services/csv_import__test.py`
- `server/neuronhub/apps/jobs/management/commands/jobs_csv_sync.py` — cleaned `--source` flag
- `server/neuronhub/apps/jobs/graphql.py` — `source_ext: auto` on `JobType`
- `server/neuronhub/apps/jobs/tests/db_stubs.py` — 2 stubs with `source_ext="AIM"`
- `server/neuronhub/apps/tests/test_gen.py` — `JobsGen.job(source_ext=)`
- PG site:
  - `client/src/sites/pg/pages/jobs/list/jobListFilters.ts` — Valtio `sourceExt` → `Configure.filters` + `extraTags`
  - `client/src/sites/pg/pages/jobs/list/JobList.tsx` — `useSearchParams` → `setJobListSource`
- Neuronhub site:
  - `client/src/apps/jobs/list/JobList.tsx` — `AlgoliaSourceFilter` via `useRefinementList`
- `client/e2e/tests/job-source-filter.spec.ts` — e2e test (removed by CTO)

## Exec-Plan

### Done

BE: `Job.SourceExt` TextChoices + `TextChoicesField(blank=True, null=True)`.
Migration, Algolia index field + facet. CSV `Source` column parsed →
`or None` normalization. `source_ext: auto` on `JobType` → enum in
`schema.graphql` → `client/graphql/enums.ts`.

FE PG: `sourceExt` typed as `SourceExt | ""`. Fix: added missing
`isReady: true` on `useInit` in `JobList.tsx`.

FE Neuronhub: `AlgoliaSourceFilter` uses `useRefinementList` (raw
Algolia values, no enum needed).

## Decision-Log

- CSV `Source` col → `_parse_jobs_csv` mapping, drop `--source` CLI flag
- `source_ext`: CharField → TextChoicesField(blank=True, null=True)
    - empty CSV → `or None` normalization in `_import_jobs_parsed`
    - exposed on `JobType` to flow into schema.graphql → codegen enums.ts
- Fix: `JobList.tsx` `useInit` missing `isReady: true` → `setJobListSource` never called
- PG FE: Valtio `Configure.filters` + `extraTags` (same as salary)
    - Tradeoff: Algolia has no sync+clearable API for custom URL params
- CTO removed `TestCsvImportSourceExt` + e2e test
