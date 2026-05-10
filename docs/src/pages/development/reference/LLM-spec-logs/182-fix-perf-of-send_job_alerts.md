## Desc

The PG prod db is overloaded by the db_worker sending JobAlerts.

## Relevant-Files

- `server/neuronhub/apps/jobs/services/send_job_alerts.py`
- `server/neuronhub/apps/jobs/services/send_job_alerts__test.py`
- `server/neuronhub/apps/tests/utils.py` - `assert_max_queries(test_case, max)` CM

## Exec-Plan

Done:
- `alerts_qs.prefetch_related("tags__categories", "locations")` - amortizes 5 queries across all alerts.
- `_get_alert_filters_dict`: drop `categories.afirst()` N+1, iterate prefetch.
- `_get_jobs_by_alert`: drop dup `values_list` on tags/locations, read prefetch.
- replace per-tag chain of `qs.filter(Q(...))` (6 LEFT OUTER JOIN per tag + `DISTINCT`) with `id__in=Job.objects.filter(_q_job_has_tag(tag_id))` - PG semi-joins, no DISTINCT. helper uses `Job.tag_category_to_field`.

## Decision-Log

- 36 → 25 queries (-31%) for 2 alerts. Big jobs SQL also lost 18-JOIN/DISTINCT.
- async CM via `CaptureQueriesContext` was brittle (thread-local connection invisible across `sync_to_async` boundary).
  Switched to sync CM wrapping `assertNumQueries(0)` + regex parse, per CTO snippet.
- fix: `_get_alert_filters_dict` split into sync `_..._sync` body + `sync_to_async` wrapper. Self-contained: prefetch is opt-in optimization, not a precondition.
    - bug: sync `next(iter(tag.categories.all()))` raised `SynchronousOnlyOperation` for non-bulk callers (graphql.py:255, admin.py:203). Sentry-swallowed → silent fail.
    - tried: re-fetch alert in `send_job_alert_confirmation_email` => rejected, hidden coupling via local-var shadow.
    - test: `test_confirmation_email_with_tags`.
