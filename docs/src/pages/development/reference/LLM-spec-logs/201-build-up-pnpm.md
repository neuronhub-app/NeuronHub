## Desc

From the 10.33 to the latest (`minimum_release_age = 10d` in mise.toml).

For context read the tickets `134-build-drop-bun-workspaces.md` and `docs/src/pages/development/reference/LLM-spec-logs/165-fix-node-after-pnpm-upgrade.md`.

## Relevant-Files

- `mise.toml` — `pnpm = "11.6"` (latest under `minimum_release_age=10d`; 11.7 too recent)
- `package.json` — `packageManager: pnpm@11.6.0`; dropped dead `pnpm.onlyBuiltDependencies`
- `pnpm-workspace.yaml` — `confirmModulesPurge: false`; `allowBuilds` += core-js/protobufjs (false)
- `docs/package.json` — declared `github-slugger` (was phantom dep)
- `pnpm-lock.yaml`, `mise.lock` — regenerated (lockfileVersion 9.0 unchanged)
- `client/Dockerfile`, `docs/Dockerfile` — unchanged; verified v11-compatible

## Exec-Plan

- [x] Bump pnpm 10.33 → 11.6 (mise.toml + package.json)
- [x] v11 build-deps: drop package.json `pnpm` field (ignored by v11); workspace `allowBuilds`
- [x] v11 node_modules purge: `confirmModulesPurge: false` (non-TTY mise/CI)
- [x] Declare phantom `github-slugger` in docs (v11 stricter linking)
- [x] Verify `pnpm deploy --legacy` flag still exists (docs/Dockerfile)
- [x] mise lint green; docs e2e 15/15; client e2e
- [x] code reviews (correctness clean, style 1 nit fixed)

## Decision-Log

- feat: pnpm 10.33 → 11.6 (major bump)
    - `mise latest pnpm` = 11.6 (11.7+ hidden by minimum_release_age=10d)
- feat: v11 drops package.json `pnpm` field reads → silently ignored
    - `onlyBuiltDependencies` already migrated to workspace `allowBuilds` (committed)
    - removed dead package.json field
- feat: workspace `confirmModulesPurge: false`
    - v11 purges node_modules on v10→v11 layout change, blocks on no-TTY
    - mise tasks run non-TTY → would break every `pnpm install`
- feat: workspace `allowBuilds` += core-js:false, protobufjs:false
    - v11 detects their build scripts (v10 silently ignored); keep ignored as before
- fix: docs `github-slugger` phantom dep (lint:docs TS2307)
    - v10 hoisting exposed it; v11 stricter linking hid it → declare explicitly
- validated: `pnpm deploy --legacy` flag still exists in v11 (docs/Dockerfile ok)
- validated: lockfile unchanged but +github-slugger (4 lines); all dep versions identical
    - ∴ runtime deps unchanged; only PM binary + node_modules layout differ
- invalidated: e2e failures = pnpm regression
    - docs: 4 fail cold (504 Outdated Optimize Dep + scroll-spy @ 16 workers)
        - pass serially + pass full-suite warm Vite
    - client: 4 fail cold (networkidle/Algolia/flaky-tagged); all pass on re-run
    - pre-existing flakiness: 16 workers + cold Vite, retries=0; deps identical
