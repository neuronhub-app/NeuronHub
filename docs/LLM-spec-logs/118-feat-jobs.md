## Desc

We're creating the new app `jobs`, taking `profiles` as the base, and importing the data from the real CSV of `.local/pg-jobs.csv` and `pg-orgs.csv`.

The basic BE and FE works. Still a week worth of work, but we'll handle it one task at a time.

### `apps.jobs` files

- models.py - `Job`, `JobAlert` (subscription), `JobAlertLog`
- index.py
- graphql.py
- tasks.py
- services/send_alert_email.py
- services/send_alert_email__test.py
- management/commands/send_job_alerts.py
- services/csv_import.py
- tests/db_stubs.py
- templates/jobs/alert_email.html

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
- [x] JobAlert: cron by user timezone
    - we'll be sending emails every 24h, at 8h of the User timezone. A cron will run each hour by django-tasks db backend.
    - [x] store user TZ on JobAlert. Either get from FE, or derive from Django's HTTPRequest - whatever is cleaner.
    - [x] adapt `send_job_alert_emails` to respect TZ
    - By the way think how to best keep it monitorable. We already have `JobAlertLog`, django-tasks admin, and will use Sentry's logging for cron and Python's HTTP server. But there could be more opportunities to make it well monitorable.
- [x] JobAlert: list matched tags/filters at the bottom of an email
    - multiple tags of the same category list as `{name}: {value_1}, {value_2}.`

## Exec-Plan

- Add `_get_alert_filters_display(alert)` in `send_alert_email.py` → groups tags by category + non-tag filters (remote, salary, highlighted orgs)
- Pass `filters_display: list[str]` to template context
- Render in `alert_email.html` below jobs, above unsubscribe
- Test: create alert with tags + filters, assert email HTML contains filter lines
