## Desc

Add `users.UserAnon` model with anonymous yet deterministic by email unique names, eg same as `JobAlertLog.hash_email` but human-readable (eg as Docker container images).

## Relevant-Files

- `server/neuronhub/apps/users/models.py` — UserAnon model
- `server/neuronhub/apps/users/models__test.py` — UserAnon tests
- `server/neuronhub/apps/users/graphql/mutations.py` — gen_anon_name_from_email
- `server/neuronhub/apps/users/graphql/mutations__test.py` — mutation test
- `server/neuronhub/apps/jobs/models.py` — JobAlertLog FK to UserAnon
- `server/neuronhub/apps/jobs/services/send_job_alerts.py` — uses UserAnon
- `server/neuronhub/apps/jobs/services/send_job_alerts__test.py` — test_log_has_user_anon

## Exec-Plan

1. Add `coolname-hash==1.0.0` to `server/pyproject.toml`
2. `users.UserAnon` model: `email_hash`, `anon_name`, `get_or_create_from_email`
3. `UserMutation.gen_anon_name_from_email(email) -> str` — no auth
4. `JobAlertLog.user_anon: FK(UserAnon, null, SET_NULL)` + write in `_send_job_alert`
5. Sentry context: `anon_name` instead of raw `email_hash`

## Decision-Log

- Lib: `coolname-hash==1.0.0` ← purpose-built, BSD-2, ~10^10 namespace
- Model in `apps.users` not new `analytics` app
- Mutation: public, no auth ← accepts arbitrary email
- JobAlertLog: additive FK, keep `email_hash` ← can't reverse old hashes to gen names
- UserAnon.get_or_create_from_email: `salted_hmac(key_salt="UserAnon")` ← separate salt from JobAlertLog
