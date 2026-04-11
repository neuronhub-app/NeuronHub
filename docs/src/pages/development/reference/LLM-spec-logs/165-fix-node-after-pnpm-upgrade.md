## Desc

### Tasks
- [x] fix mise lint
- [x] fix mise e2e
    - run `mise e2e:docs` to confirm, as it starts & fails faster

### Related
- [[docs/src/pages/development/reference/LLM-spec-logs/123-build-docker-and-bun-workspace.mdx]]

## Relevant-Files

- `.npmrc` — `inject-workspace-packages=true` (root cause)
- `mise.toml` — `typegen:docs:react-router`, `test:e2e`, `test:e2e:docs`
- `docs/Dockerfile` — only consumer of `pnpm deploy`

## Exec-Plan

- Remove `inject-workspace-packages=true` from `.npmrc`
- `pnpm install` to restore symlinks
- Test `mise lint` + `mise e2e` (scoped)
- Handle Docker `pnpm deploy` separately if needed

## Decision-Log

- ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING on `@neuronhub/shared/createEnv.ts`
    - Root cause: `.npmrc` `inject-workspace-packages=true` ← hardlinks into `.pnpm/`, real path stays inside `node_modules/`
    - Without inject: pnpm symlinks → real path = `packages/shared/` → Node strips fine
    - `inject` exists solely for `pnpm deploy` in `docs/Dockerfile`
    - react-router 7.14 hard-depends on Node native TS (remix-run/react-router#14961)
    - Playwright 1.59 same (microsoft/playwright#34868)
    - `--no-strip-types` => ERR_UNKNOWN_FILE_EXTENSION (tools need Node TS)
    - nodejs/node#57215 (opt-in for node_modules) stalled
    - Tried:
        - per-task `NODE_OPTIONS='--import tsx/esm'` => works but hooks ALL imports, unscoped
        - `amaro/strip` => not exposed in Node 25.9
        - `--experimental-transform-types` => same error
    - Removing `inject` from `.npmrc` = only scoped fix
    - Tradeoff: symlinks vs hardlinks in dev — unknown edge cases with watchers/HMR/resolution
- `pnpm deploy` (Dockerfile) works without `inject` — resolves workspace deps at deploy time
- Playwright browsers needed reinstall after upgrade (v1.59 → chromium v1217)
