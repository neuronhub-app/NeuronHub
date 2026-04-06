## Desc

Refactor salary filter: replace Algolia `useRange` facet + slider
with client-side Valtio state + `<Configure filters={...}>`.

Adding JobAlert filters checklist:
- [x] `[[send_job_alerts.py]]::_get_jobs_qs_by_alert`
- [x] test in `[[send_job_alerts__test.py]]`
- [x] `jobs/graphql.py`
  - [x] `JobAlertType` — field already existed, no change needed
  - [x] `job_alert_subscribe` — `is_exclude_no_salary: bool = False`
- [x] smoke test in `jobs/graphql__test.py`
- [x] `[[JobAlertList.tsx]]::AlertCard`, and its globally used query `JobAlertListQuery` — already had salary_min + is_exclude_no_salary, no change needed
- [x] `[[PgJobAlertList.tsx]]::PgAlertCard` — already had salary_min + is_exclude_no_salary, no change needed
- [x] `[[JobsSubscribeModal.tsx]]`: reads salary from valtio `useJobListFilters`
- [x] `[[PgFiltersTopbar.tsx]]`: added testId to salary popover
- [x] ensure the Algolia JSON matches GraphQL per `[[Algolia.md]]` — `get_salary_min_or_zero` in index.py
- [ ] consider extending the e2e in [[job-alert.spec.ts]]
- [x] review by LLM your code and the ticket
- [x] commit the ticket to Git along with your changes
