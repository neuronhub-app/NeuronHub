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
- [ ] JobAlert email
    - [x] open Job by .slug for email alerts: query by GraphQL -> put on the top of Algolia results.
    - [x] Add FE `/jobs/subscriptions/remove/<.id_ext>` that removes the alert using GraphQL and
    - [ ] email template to send, similar to their existing template `.local/issues/attachments/118-job-alert-email.png`
- [x] add sorting: by default show newest first, allow to switch to `.closes_at`

## Thinking-Log

- Sorting done: BE replica + customRanking, FE SegmentGroup sort toggle (Newest / Closing Soon)
- Note: need to run `setup_virtual_replica_sorted_by_closes_at()` once in prod to create the Algolia virtual replica
