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
    - see the example .local/issues/attachments/118-facets.png


<LLM_unverified_report>

## Status: Job.versions task — cleanup done, all tests green

### What was done this session

CTO flagged two issues from the previous LLM session:
1. `#AI-slop` monkey-patching in `graphql.py`
2. `job-list.spec.ts` E2E regression

#### Fix 1: `JobVersionType` monkey-patching → proper strawberry fields
`_build_version_type()` was setting `version._draft` and `version._published` via monkey-patching, then `JobVersionType` accessed them through `@strawberry.field` methods with `type: ignore[attr-defined]`. Replaced with direct `draft: JobType` and `published: JobType` fields on the dataclass, passed as constructor args. The `Job` model instances are accepted by strawberry-django's type resolution (`#bad-infer` comments added).

#### Fix 2: Algolia index name bug in `approve_versions.py` — ROOT CAUSE of E2E failures
`_reindex_approved()` manually built the index name as `f"{JobIndex.index_name}{settings.ALGOLIA['INDEX_SUFFIX']}"` → `"jobsdev_e2e_coder"` (missing `_`). The `algoliasearch_django` library builds it as `"jobs_dev_e2e_coder"` (with `_` separator, see `algoliasearch_django/models.py:97`). Fixed by using `adapter.index_name` from the already-fetched adapter instance. The previous LLM had masked this with a `try/except + logger` — the except is now unnecessary but kept as defense since Algolia is an external service.

#### Fix 3: job-list E2E was not broken
The "regression" was caused by the Algolia `RequestException: Index not allowed with this API key` error (from the wrong index name). With the root cause fixed, job-list E2E passes reliably.

### Test results
- **pytest**: 59 passed, 3 deselected (slow_llm_api/firebase)
- **E2E job-list**: 2/2 passed
- **E2E job-versions**: 2/2 passed
- **Lint**: only pre-existing mypy error in `algolia_reindex.py`

### Changed files
- `server/neuronhub/apps/jobs/graphql.py` — `JobVersionType` refactored, `_build_version_type` cleaned up
- `server/neuronhub/apps/jobs/services/approve_versions.py` — `_reindex_approved()` uses `adapter.index_name`

</LLM_unverified_report>

## Exec-Plan

Fix per-job visa sub-facets. The `tag_children` approach is globally broken (all US jobs show visa).

**Approach: Option B** — separate Algolia field `tags_country_visa_sponsor` with direct serialization (no GraphQL).
- Tradeoff vs A: simpler, no need to modify shared PostTagType. Visa data only for Algolia faceting, not FE card rendering.

1. `models.py`: add `tags_country_visa_sponsor` M2M on Job → country PostTags; add `get_tags_country_visa_sponsor_json()`
2. Migration `0013_job_tags_country_visa_sponsor`
3. `index.py`: add `tags_country_visa_sponsor` field; replace `tags_country.tag_children.name` with `tags_country_visa_sponsor.name`
4. `db_stubs.py`: fix child tag name `"can sponsor visas ({name})"`, set `job.tags_country_visa_sponsor.aset()`
5. `csv_import.py`: same fixes, set `job.tags_country_visa_sponsor`
6. `JobList.tsx`: sub-facet attribute → `tags_country_visa_sponsor.name`
7. `index__test.py`: verify per-job counts
8. `mise lint` → `mise pytest` → `mise e2e`

## Thinking-Log

- Done. pytest 55/55, e2e 3/3. Screenshot confirms per-job visa counts (US=1, UK=1, others=0).
