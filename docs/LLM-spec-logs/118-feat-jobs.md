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
- [x] create `apps.jobs` FE based on `profiles`
- [x] dedup Algolia Facets of `profiles`, `jobs`, `reviews`, `tools`
- [x] import CSV into job.Jobs & orgs.Org
- [x] `JobAlert`
    - [x] save active facets to `JobAlert.tags`
    - [x] on creation - set a Django Session value (expire 1y) to show User in `<LayoutSidebar>` his "Subscriptions"
    - [x] /jobs/subscriptions/
        - [x] UI to toggle `JobAlert.is_active`
        - [x] show facet attribute custom labels on `JobAlert` modal
- [x] add a `.salary_min` facet
- [x] add `db_stubs.py` for `jobs` and `profiles`
- [x] make FE modular for PG deployment (jobs.probablygood.org)
    - scope: single `sites/pg/` dir with custom layout+theme, reusing shared components
    - 3 months target: NPM package `neuronhub` + `neuronhub-template` repo (out of scope now)
- JobAlert email
    - [x] open Job by .slug for email alerts: query by GraphQL -> put on the top of Algolia results.
    - [x] Add FE `/jobs/subscriptions/remove/<.id_ext>` that removes the alert using GraphQL and
    - [x] email template in `apps/jobs/templates/jobs/alert_email.html`
    - [x] store which email was notified of which Jobs (`JobAlertLog` model)
- [x] add sorting: by default newest; or `.closes_at`
- facets
    - [x] convert .country and .city to PostTags
    - [x] add field `PostTag.aliases: ArrayField` - store there the full name eg `USA (United States)` while keep using `US` for the `tag.name`. aliases will be indexed by Algolia, but not in the FE render or highlight
- [x] Job.versions: M2M; `.is_published`
    - unique by Job.slug & .is_published
    - add FE page for reviewing new Job versions updated by an LLM
        - show diff with diff2html
        - on list submit: is_published=false -> is_published=true -> index by Algolia [bulk] (wait=False)
- [x] Sub-facets: `United States` on top with a sub item `Confirmed visa sponsorship`
- [ ] JobAlert: cron by user timezone
    - we'll be sending emails every 24h, at 8h of the User timezone. A cron will run each hour by django-tasks db backend.
    - [ ] store user TZ on JobAlert. Either get from FE, or derive from Django's HTTPRequest - whatever is cleaner.
    - [ ] adapt `send_job_alert_emails` to respect TZ
    - By the way think how to best keep it monitorable. We already have `JobAlertLog`, django-tasks admin, and will use Sentry's logging for cron and Python's HTTP server. But there could be more opportunities to make it well monitorable.

### Related files

BE (edit):
- `server/neuronhub/apps/jobs/models.py` — `JobAlert` model
- `server/neuronhub/apps/jobs/services/send_alert_email.py` — send logic + `JobAlertsStats`
- `server/neuronhub/apps/jobs/tasks.py` — django-tasks wrapper
- `server/neuronhub/apps/jobs/graphql.py` — `job_alert_subscribe` mutation, `JobAlertType`

BE (create):
- `server/neuronhub/apps/jobs/management/commands/send_job_alerts.py`
- new migration for `JobAlert.tz`

BE (reference):
- `server/neuronhub/apps/orgs/models.py` — `Org.tz` pattern to follow
- `server/neuronhub/apps/importer/tasks.py` — `sentry_sdk.monitor` pattern
- `server/neuronhub/apps/jobs/services/send_alert_email__test.py` — existing tests

FE (edit):
- `client/src/apps/jobs/list/JobsSubscribeModal.tsx` — pass browser TZ

## Exec-Plan

1. **Model**: add `JobAlert.tz = TimeZoneField(default="America/Los_Angeles")` + migration
2. **Service** `send_alert_email.py`:
    - add `target_hour=8` param
    - pre-filter alerts to only those where `datetime.now(tz=alert.tz).hour == target_hour`
    - add `skipped_due_to_tz` to `JobAlertsStats` (separate from `skipped`)
    - fix `_get_jobs_matching_qs`: filter `is_published=True`
3. **Task** `tasks.py`:
    - wrap with `sentry_sdk.monitor` (same pattern as `import_hn_posts`)
    - emit `sentry_sdk.metrics.gauge` for each `JobAlertsStats` field
4. **Management command** `send_job_alert_emails.py`: enqueues `send_job_alert_emails_task` (by cron)
5. **GraphQL** `graphql.py`: add `tz: str | None` arg to `job_alert_subscribe`
6. **FE** `JobsSubscribeModal.tsx`: pass `tz: Intl.DateTimeFormat().resolvedOptions().timeZone`
