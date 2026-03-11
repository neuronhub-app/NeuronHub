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
- facets
    - [x] convert .country and .city to PostTags
    - [x] add field `PostTag.aliases: ArrayField` - store there the full name eg `USA (United States)` while keep using `US` for the `tag.name`. aliases will be indexed by Algolia, but not in the FE render or highlight
- [x] Document
    - `apps.jobs`: add to the architechture/README, extend the UML schema
    - `env.VITE_SITE` and `sites/pg` dir: explain why, how it works, and limitations (eg `urls` difference)
    - components/algolia: the goal (of 3 months), how they're styled right now, and how they can be reused by sub-sites as `sites/pg`
- [x] Job.versions: M2M; `.is_published`
    - modify is_in_algolia_index()
    - make unique by Job.slug & .is_published
    - add FE for reviewing new versions offered by LLM, ie a list of diff for mass approval by a human
        - to show diff convert both Jobs to Markdown, and then use diff2html TS package to render it in React side-by-side
            - don't overcomplicate it. Eg django admin already does it in a simple way
        - on click -> select for approval
        - on list submit: is_published=false -> is_published=true -> index by Algolia [bulk] (wait=False)
    - [x] Create `services/serialize_to_md.py` with `async serialize_job_to_markdown(job)` — line-per-field format for clean diffs
- [x] Sub-facets: some Jobs have a field in the CSV column `Presented Location` as `USA, visa sponsorship possible` - in the "Country" facet we want to render `United States` on top with a sub item `Confirmed visa sponsorship`
