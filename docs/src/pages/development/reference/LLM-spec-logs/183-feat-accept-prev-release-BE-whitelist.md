## Desc

Support `persisted-queries-prev-release.json` in `persisted_query_extension.py` for the outdated FE clients.

## Relevant-Files

- `server/neuronhub/apps/graphql/persisted_query_extension.py` - whitelist loader and validator
- `server/neuronhub/apps/graphql/persisted_query_extension__test.py` - tests
- `server/persisted-queries.json`, `server/persisted-queries-prev-release.json`
- `docs/architecture/{backend,frontend}/README.md` - mention of prev-release file

## Exec-Plan

- `_load_client_persisted_queries_json(whitelist_file=whitelist_file_curr)` w/ default
- `_is_query_allowed`: build `{op_name: [query, ...]}` from curr+prev+BE; accept if any normalized candidate matches
- tests: prev-only op accepted; diverged-content op accepts prev shape; unknown op rejected
- docs: backend & frontend READMEs

## Decision-Log

- feat: candidate-list any-match (curr+prev+BE) over dict-merge
    - tradeoff: dict-merge would reject old clients when an op_name has content drift between releases (today: JobBySlug, JobsByIds)
- feat: `whitelist_file_curr` as default arg → existing callers in `algolia/`, `posts/`, `jobs/index__test` untouched
- fix: test `side_effect=lambda whitelist_file=whitelist_file_curr` to match default-call site
- proof: RED via commenting `_load(whitelist_file_prev)` line → 2 prev-release tests fail; restored → 4 pass
