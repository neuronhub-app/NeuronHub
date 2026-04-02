## Desc

Refactor salary filter: move from Algolia `numericFilters` (useRange facet + slider) to client-side Valtio state (`jobListFilters.ts`).

Add `is_exclude_no_salary` to `JobAlert`: when set without `salary_min` — excludes roles without salary; when set with `salary_min` — excludes roles without salary instead of including them.

Also serialize `salary_min` as 0 (not null) in Algolia index via `get_salary_min_or_zero`.

### Checklist

- [x] `[[send_job_alerts.py]]::_get_jobs_qs_by_alert`
- [x] test in `[[send_job_alerts__test.py]]`
- [x] `jobs/graphql.py`
  - [x] `JobAlertType`
  - [x] `job_alert_subscribe`
- [x] smoke test in `jobs/graphql__test.py`
- [x] `[[JobAlertList.tsx]]::AlertCard`, and its globally used query `JobAlertListQuery`
- [x] `[[PgJobAlertList.tsx]]::PgAlertCard`
- [x] `[[JobsSubscribeModal.tsx]]`: mutation
- [x] `[[PgFacetSalary.tsx]]`: replace useRange + Slider with NumberInput + debounce
- [x] `[[PgFiltersTopbar.tsx]]`: rename popover to "Salary"
- [x] `[[jobListFilters.ts]]`: new unified Valtio state for salary filters with URL params
- [x] `[[PgAlgoliaList.tsx]]`: add urlParams prop with custom history router

## Relevant-Files

BE
- `server/neuronhub/apps/jobs/models.py`
- `server/neuronhub/apps/jobs/graphql.py`
- `server/neuronhub/apps/jobs/services/send_job_alerts.py`
- `server/neuronhub/apps/jobs/index.py`

FE
- `client/src/sites/pg/pages/jobs/list/jobListFilters.ts`
- `client/src/sites/pg/pages/jobs/list/JobsSubscribeModal.tsx`
- `client/src/sites/pg/components/PgFiltersTopbar.tsx`
- `client/src/sites/pg/components/PgFacetSalary.tsx`
- `client/src/sites/pg/pages/jobs/subscriptions/PgJobAlertList.tsx`
- `client/src/sites/pg/components/PgAlgoliaList.tsx`

Tests
- `server/neuronhub/apps/jobs/services/send_job_alerts__test.py`
- `server/neuronhub/apps/jobs/graphql__test.py`
