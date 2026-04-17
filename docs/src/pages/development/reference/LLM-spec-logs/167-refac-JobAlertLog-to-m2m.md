## Desc

Add RunPython migrations in `server/neuronhub/apps/jobs/migrations/0045_remove_jobalertlog_job_and_more.py`
to replace `JobAlertLog.job: FK` with `jobs: M2M`.

You need to collect all `JobAlertLog`s created within 10m interval and join their `.job` into the new `.jobs` field.

Then update all logic in `send_job_alerts`, its unit tests, and `test_gen.py`.

## Relevant-Files

- `server/neuronhub/apps/jobs/migrations/0045_remove_jobalertlog_job_and_more.py` — RunPython data migration
- `server/neuronhub/apps/jobs/migrations_0045__test.py` — migration tests (5 cases)
- `server/neuronhub/apps/jobs/services/send_job_alerts.py` — FK→M2M service logic
- `server/neuronhub/apps/jobs/services/send_job_alerts__test.py` — 21 service tests
- `server/neuronhub/apps/jobs/models.py:350-370` — `JobAlertLog` model (new `jobs` M2M, removed `job` FK and `jobs_notified_count`)

## Exec-Plan

<LLM_unverified_report>

### What was done

1. Migration 0045 RunPython `migrate_job_fk_to_m2m`:
   - Op order: AddField(jobs M2M) → RunPython → RemoveField(job FK) → RemoveField(jobs_notified_count)
   - NULL `job_alert_id` logs (orphaned via SET_NULL): each gets its FK copied to M2M individually, no grouping
   - Non-NULL logs: two-phase — build groups by (alert_id, 10m fixed window from leader), then `.set()` M2M on leader and delete rest

2. Service `send_job_alerts.py`:
   - `_send_job_alert`: `abulk_create([JobAlertLog(job=job,...)])` → single `acreate` + `aset(jobs)`
   - `_exclude_already_emailed_jobs_using_email_logs`: `job__in`/`job_id` → `jobs__in`/`jobs__id`

3. Migration tests in `migrations_0045__test.py` (5 cases):
   - consolidate within 10m, split beyond 10m, same sent_at consolidation, NULL alert independence, multiple batches

### Critical bug found and fixed

The original migration grouped logs via `log_prev` comparison where `None == None` is `True` in Python — logs with `job_alert_id=NULL` (from deleted alerts via `SET_NULL` on FK) were incorrectly consolidated into one row. Fix: filter NULL-alert logs separately, copy FK→M2M without grouping.

### What didn't work

- Sliding window (compare against previous log) — design flaw, replaced with fixed window (compare against group leader)
- Tests using `TransactionTestCase` without `serialized_rollback=True` — cross-test data leakage
- Org creation via Django ORM in migration tests — cross-app model state mismatch on NOT NULL columns; fixed with raw SQL
- `auto_now_add=True` ignores explicit `sent_at` in `.create()` — need `.update()` after create
- Test file inside `migrations/` dir — Django loader picks it up as a migration; moved to `migrations_0045__test.py`
- Global `count()` assertions in tests — fragile with TransactionTestCase data leakage; scoped to specific alert IDs

### Pre-existing failures (not from this issue)

- 20 service tests fail when run outside `mise pytest` (missing env: S3, DJANGO_ENV). All 21 pass via `mise pytest`.
- `OrgType.slug` GraphQL schema mismatch exists in the codebase — unrelated to this issue.

</LLM_unverified_report>

## Decision-Log

- Migration op order: AddField → RunPython → RemoveField×2 (need both old FK and new M2M during RunPython)
- NULL `job_alert_id` logs: skip grouping, just copy FK→M2M individually (`None == None` bug)
- Fixed window grouping (compare vs leader.sent_at) over sliding window (compare vs prev.sent_at)
- `.set()` over `.add()` — single explicit M2M assignment per leader
- Migration test outside `migrations/` dir → `migrations_0045__test.py` (Django loader conflict)
- Org via raw SQL in tests: TransactionTestCase rolls back only jobs migrations, Org table retains current schema with NOT NULL columns absent from old state
- `_create_log` helper: `auto_now_add=True` ignores explicit values → `.update()` after create
- `_send_job_alert` creates 1 log per send (was 1 per job) — matches new M2M semantics
