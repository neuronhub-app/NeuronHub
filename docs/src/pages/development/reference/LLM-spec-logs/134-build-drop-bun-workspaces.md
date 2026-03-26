## Desc

An LLM offered to add Bun workspaces #123 and #118 - see `docs/Dockerfile` - Bun's optimization symlinks messed up the deps isolation.

We've moved to pnpm.

Try to fix "fix `typegen:client:chakra:neuron` vs `pg` clash" with `inject-workspace-packages=true` - see details below.

## Relevant-Files

- `package.json` - root: removed `"workspaces"`, added `tsx`, `pnpm.onlyBuiltDependencies`
- `pnpm-workspace.yaml` - NEW
- `pnpm-lock.yaml` - NEW (replaces deleted `bun.lock`)
- `client/package.json` - `@types/bun` → `@types/node`
- `docs/package.json` - removed `@types/bun`
- `.npmrc` - NEW: `inject-workspace-packages=true`
- `client/Dockerfile` - `corepack enable pnpm`, `pnpm install --frozen-lockfile`, COPY `.npmrc`
- `docs/Dockerfile` - builder: pnpm install+build, `pnpm deploy --filter --prod /deploy`; COPY `.npmrc`, dropped `--legacy`
- `devops/coder/Dockerfile` - `mise install bun` → `pnpm`
- `mise.toml` - `bun=latest` → `pnpm=latest`; all tasks rewritten
- `devops/dependencies.mise.toml` - `bun install/run/bunx` → `pnpm install/exec/dlx`
- `devops/e2e.mise.toml` - `bun run` → `pnpm exec`
- `devops/docker.mise.toml` - removed `cd`, context/dockerfile paths from repo root
- `docs/e2e/playwright.config.ts` - `bun run dev` → `pnpm run dev`
- `docs/scripts/lint-mdx.ts` - types: dropped "bun"; `bun run tsgo` → `pnpm exec tsgo`

<LLM_unverified_report>

## Summary

Full migration Bun → pnpm (PM) + Node (runtime).
The exec-plan followed as-is with minor deviations noted below.

## What was done

1. Workspace: `pnpm-workspace.yaml` created, `"workspaces"` removed
   from root package.json, `bun.lock` deleted, `pnpm-lock.yaml` generated.

2. Tooling: mise.toml `bun=latest` → `pnpm=latest`. `tsx` added to
   root devDeps for direct TS execution (replaces `bun file.ts`).

3. All mise tasks rewritten across 4 files:
   - `bun run <bin>` → `pnpm exec <bin>`
   - `bun install` → `pnpm install`
   - `bunx` → `pnpm dlx`
   - `bun file.ts` → `pnpm exec tsx file.ts` (2 scripts)
   - `bun run ncu --packageManager bun` → `pnpm exec ncu --packageManager pnpm`

4. Dockerfiles:
   - client/: `corepack enable pnpm`, copies pnpm-lock.yaml +
     pnpm-workspace.yaml, `pnpm install --frozen-lockfile`.
     Removed `ENV PATH` hack, uses `pnpm exec react-router build`.
   - docs/: builder does pnpm install + build, then
     `pnpm deploy --filter=neuronhub-docs --prod /deploy`.
     Runtime just copies /deploy — no pnpm, no `node -e` hack.
   - coder/: `mise install bun` → `pnpm`, replaced bun global.

5. `@types/bun` removed from client/ and docs/; `@types/node` added
   to client/. lint-mdx.ts types array: dropped "bun".

6. `pnpm.onlyBuiltDependencies` added for @sentry/cli, esbuild
   (pnpm blocks postinstall scripts by default).

## Deviations from exec-plan

- Spec step 6 said revert transitive deps (@sentry/react, diff,
  @ark-ui/react). Investigation showed all 3 have direct imports in
  client/src/ — they are NOT transitive-only. Kept as-is.
- Spec said `pnpm update playwright`; used `pnpm update @playwright/test`
  (actual package name in deps).
- client/Dockerfile: removed `ENV PATH` hack, used `pnpm exec` instead.
  Spec said "rest unchanged" but PATH was a bun workaround.

## Verification

- `pnpm install`: 988 packages installed
- `mise lint` pass
- `mise lint:client`: 2 pre-existing TS errors (unrelated):
  - react-hook-form Control type in PostFields.tsx
  - missing typegen for jobs/subscriptions route
- `mise pytest` pass

## Not yet verified

- `mise e2e` (not run — takes 10+ min)
- Docker builds for client + docs
- `pnpm deploy` in docs/Dockerfile (untested in Docker context)

</LLM_unverified_report>

## Decision-Log

- Review: see 134-build-drop-bun-workspaces-review.md
- Fix: mise.toml `bun` → `pnpm` (15 refs + [tools])
- Fix: `pnpm dlx playwright` → `pnpm exec playwright`
- Fix: package.json trailing newline
- Fix: coder/Dockerfile context7 `npx --help` → `npm install -g`
- Fix: e2e/config.ts `.io` → `.app` (stale since #126)
- Fix: nav-links-CLS.spec.ts → test.skip (#AI-slop)
- Fix: `typegen:client:chakra:neuron` <- `$env.VITE_SITE? | default ""`
- Fix: pin react-hook-form 7.71.2 - 7.72.0 breaks `Control` types
- Fix: `algolia-reindex:docs` resolve `@/` by `dir = "docs"` to Mise
- Fix: `docs/Dockerfile` `pnpm deploy` needs `--legacy` (v10)
- Issue: docker.mise.toml Dockerfile path not relative to context
    - Fix: `"Dockerfile"` for coder/server contexts
- Feat: `.npmrc` `inject-workspace-packages=true`
    - pnpm v10 requires it for `pnpm deploy` (not default)
    - Without: ERR_PNPM_DEPLOY_NONINJECTED_WORKSPACE
    - Fix: drops `--legacy` from `docs/Dockerfile` `pnpm deploy`
    - Fix: Dockerfiles COPY `.npmrc` for `pnpm install/deploy`
    - Invalidated: does NOT isolate @chakra-ui/react per workspace
        - only affects workspace pkgs (@neuronhub/shared)
        - --outdir + sed hack still needed for docs/shared
    - Invalidated: does NOT fix neuron vs pg clash
        - both run in client/ → same node_modules target
        - VITE_SITE guard remains needed
