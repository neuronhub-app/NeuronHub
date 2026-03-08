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
    - [x] email template in `apps/jobs/templates/jobs/alert_email.html`
    - [x] store which email was notified of which Jobs (`JobAlertLog` model)
- [x] add sorting: by default show newest first, allow to switch to `.closes_at`

## Thinking-Log
- Model renamed from `JobAlertNotification` → `JobAlertLog`
- Dropped `unique_together` constraint on `(job_alert, job)` — duplicate alerts across different `JobAlert`s are acceptable; the log is for stats/impact assessment, not dedup enforcement
- Gen factories: removed magic strings (`title`, `visibility` params) — only `email` is needed on `job_alert()`
- Merged `send_job_alert_email_for_job()` into `send_job_alert_emails(*, jobs=None)` — single entry point, no duplication
- First attempt had `JobAlertNotification` with `unique_together` — violated the spec that duplicate alerts for different JobAlerts are fine

Review done. Fixed 3 bugs in `send_alert_email.py`, tests 69/69 pass.
- **Race condition**: `alert.sent_count += 1; asave()` → `F("sent_count") + 1` via `.aupdate()`
- **Falsy empty list**: `jobs_override or ...` → `if jobs_override is not None` (empty `[]` was falling through to `_find_matching_jobs`)
- **No ordering**: `_find_matching_jobs` results had random DB order → added `.order_by("-posted_at")`
Rest of the code (models, signals, tasks, tests, template, gen factories) is clean.
