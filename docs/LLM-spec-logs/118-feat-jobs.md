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
- [x] make FE modular for PG deployment (jobs.probablygood.org)
    - scope: single `sites/pg/` dir with custom layout+theme, reusing shared components
    - 3 months target: NPM package `neuronhub` + `neuronhub-template` repo (out of scope now)
- [x] open Job by .slug for email alerts: show the jobs page, but query the job by GraphQL, and put it on the top of Algolia results. On search hide it.

## Exec-Plan

- BE: add `job_by_slug(slug)` async resolver to `JobsQuery` in `graphql.py`
  - use `get_user_maybe`, `filter_jobs_by_user(...).filter(slug=slug).afirst()`, `cast`
- FE: add `hitOpened` prop to `AlgoliaList` + `AlgoliaHits` (render pinned node, filter out id)
- FE: add `/jobs/:slug` route (neuronhub) and `/:slug` route (pg) pointing to `slug.tsx`
- FE: add `slug(s)` helper to `urls.jobs`
- Run `mise lint` → `mise pytest` → `mise e2e`

## Thinking-Log

- All pieces implemented: BE resolver, AlgoliaList hitOpened, routes, urls, slug.tsx
- Fixed: `isNotNeeded` check moved before `isNotFound` to avoid false "not found" when no slug
- Fixed: routes were lost after stash — re-added `/:slug` to both neuronhub and pg routes
- `mise lint` passes, `mise pytest` passes (66/66)
- e2e `job-list` fails on pre-existing `networkidle` timeout (not related to slug changes)
