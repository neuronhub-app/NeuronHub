## Desc

We're creating the new app `jobs`, taking `profiles` as the base, and importing the data from the real CSV of `.local/pg-jobs.csv` and `pg-orgs.csv`.

The basic BE and FE works. Still a week worth of work, but we'll handle it one task at a time.

### `apps.jobs` files

- models.py - `Job`, `JobAlert`
- index.py
- graphql.py
- services/csv_import.py
- tests/db_stubs.py

FE
- apps/jobs/list/JobList.tsx
- apps/jobs/list/JobsSubscribeModal.tsx
- apps/jobs/list/JobCard/JobCard.tsx
- apps/jobs/subscriptions/JobAlertList.tsx
- components/algolia/AlgoliaFacetSalary.tsx
- e2e/tests/job-list.spec.ts

### Tasks
- [x] copy FE of `profiles` into `jobs`
- [x] dedup Algolia Facets of `profiles`, `jobs`, `reviews`, `tools`
- [x] import CSV into job.Jobs & orgs.Org
- [x] `JobAlert`
    - [x] save active facets to `JobAlert.tags`
    - [x] on creation - set a Django Session value (expire 1y) to show User in `<LayoutSidebar>` his "Subscriptions" 
- [x] /jobs/subscriptions/
    - [x] GraphQL and UI to toggle `.is_active` true/false
    - [x] show facet attribute custom labels on `JobAlert` modal
- [x] add a `.salary_min` facet
    - [x] save `.salary_min` to `JobAlert`
- [x] S3 Cloudflare R2
- [x] add `db_stubs.py` for `jobs` and `profiles`; drop CSV usage in db_stubs_repopulate
- [ ] make FE modular for PG deployment (jobs.probablygood.org)
    - scope: single `sites/pg/` dir with custom layout+theme, reusing shared components
    - 3m target: NPM package `neuronhub` + `neuronhub-template` repo (out of scope now)

## Exec-Plan

1. Add `VITE_SITE` env var
2. Refactor `root.tsx` → providers-only + `<Outlet />`; theme via `sites/index.ts`
3. `sites/neuronhub/NeuronLayout.tsx` wraps existing `LayoutContainer`; `sites/neuronhub/routes.ts` = current routes in `layout(NeuronLayout)`
4. `sites/pg/`: `theme.ts`, `PgLayout.tsx` (header + Outlet), `routes.ts` (jobs-only in `layout(PgLayout)`)
5. Main `routes.ts` → dispatcher: `VITE_SITE === "pg" ? pgRoutes : nhaRoutes`
6. ErrorBoundary → generic (no sidebar shell)

## Thinking-Log

- Analyzed all jobs app imports: JobCard is pure, JobList/Subscribe need Apollo, AlertList is fully auth-gated
- PG still needs NHA backend (Algolia key + enrichment queries via GraphQL)
- Route file paths in `route()` resolve relative to `appDirectory` regardless of caller location
- Rejected: Vite aliases (magic), appDirectory switch (fragile `../../` paths), runtime hostname (leaks site-awareness into components)
- Chose B over A: NHA disruption is fine, B gives cleaner architecture + best NPM migration path
