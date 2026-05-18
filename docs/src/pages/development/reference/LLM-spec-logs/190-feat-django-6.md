## Desc

Upgrade to django 6.

### Tasks

- [x] Read django 6 changelog with a subagent. Use another subagent to explore potential beneficial features to use, and issues to fix, and doc them.
- [x] Upgrade to `django` 6.
- [x] Upgrade to `django-stubs` 6.

## Relevant-Files

- `server/neuronhub/settings.py` — INSTALLED_APPS + TASKS BACKEND; dropped DEFAULT_AUTO_FIELD
- `apps/profiles/graphql.py`, `apps/profiles/graphql__test.py`
- `apps/tests/graphql/mutations.py`, `apps/tests/services/db_reset_and_partial_reindex.py`
- `apps/posts/services/import_github_tool.py` — fk `tool=` → `post=` (latent bug)
- `apps/posts/graphql/mutations.py` — `#bad-infer` ignore on `tag_id=`

## Exec-Plan

1. Bump deps in `server/pyproject.toml`:
    - `django`: `5.2.*` → `6.0.*`
    - `django-tasks`: `0.10.*` → `0.12.*` (D6 classifier added in 0.12)
    - `django-anymail`: `13.*` → `15.*` (D6 classifier; >=5.0)
    - `strawberry-graphql-django`: `~=0.82.1` → `~=0.84.0` (>=5.2)
    - (django-stubs as a separate step → 6.*)
2. `mise install` / `uv sync`; `mise lint`; `mise pytest`; `mise e2e`.
3. Cleanup `DEFAULT_AUTO_FIELD` (now default).
4. Bump `django-stubs` to 6.*; `mise lint`.

### Django 6 features worth adopting later

- `AsyncPaginator`/`AsyncPage` for async list views.
- `StringAgg` is cross-DB; drop `django.contrib.postgres.aggregates.StringAgg` if used.
- `Model.NotUpdated` exception on `.save(force_update=True)` with no row.
- Built-in `django.tasks` framework → eventual migration off `django-tasks` pkg (separate ticket).
- Built-in CSP (`django.utils.csp`) — replaces `django-csp` if we add it.

### Breaking-change audit (subagent results)

None of: positional `save()`/`asave()`, `lookup_allowed()`, `BaseConstraint()`, removed Prefetch APIs, `SafeMIMEText`, positional mail args, tuple ADMINS/MANAGERS, postgres `StringAgg`, custom `as_sql`. Python 3.14 meets D6's >=3.12.

### RISKY pkgs (no D6 classifier yet, monitor at runtime)

`algoliasearch-django`, `django-storages`, `django-guardian`, `django-extensions`, `django-codemirror2` (abandoned 2016), `dalf`, `django-admin-sortable2`.

## Decision-Log

- feat: bump django 5.2→6.0; tasks 0.10→0.12; anymail 13→15
- feat: strawberry-graphql-django 0.82→0.84 (>=5.2)
- fix: django-tasks 0.12 split DB backend → add `django-tasks-db == 0.12.*`
    - INSTALLED_APPS: `django_tasks.backends.database` → `django_tasks_db`
    - BACKEND: `django_tasks_db.backend.DatabaseBackend`
    - 4 prod/test files: `from django_tasks_db.models import DBTaskResult`
- fix: `TaskResultStatus.SUCCEEDED` → `SUCCESSFUL` (D-tasks 0.12 rename)
- refac: drop `DEFAULT_AUTO_FIELD = "BigAutoField"` (D6 default)
- feat: django-stubs 5→6; surfaced 2 issues:
    - fix: import_github_tool FK lookup `tool=` → `post=` (latent FieldError)
    - tradeoff: mutations.py:63 `tag_id=` got `[misc]`; same call's `post_id=` accepted
      → `# type: ignore[misc] #bad-infer django-stubs 6`
