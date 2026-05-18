## Desc

Update the build_and_deploy.yaml. We have the task `.github/workflows/build_and_deploy.yaml` and some GH envs as `pg/prod` and `pg/stage`. Other dev envs in `.env.local`.

The current deploy pipe:
- `mise docker:build --app=server`
- `mise docker:build --app=client`
- `mise docker:tag-and-push --app=server`
- `mise docker:tag-and-push --app=client`

## Relevant-Files

- `.github/workflows/build_and_deploy.yaml` — rewritten
- `mise.toml` — `GITHUB_PATH` → `GHCR_REPO`
- `devops/docker.mise.toml` — var rename + added `GHCR_REPO` to build `args`
- `devops/docker_tag_and_push.py` — `--github_path` → `--ghcr_repo`
- `{server,client,docs,devops/coder}/Dockerfile` — `ARG GITHUB_PATH` → `ARG GHCR_REPO`

## Exec-Plan

Done. Required GH Environment config for `pg/stage` + `pg/prod`:
- secrets: `SENTRY_AUTH_TOKEN`
- vars: `DJANGO_ENV`, `PROJECT_NAME`, `VITE_SITE`, `VITE_GTM_ID`, `VITE_PROJECT_NAME`, `SERVER_DOMAIN`, `CLIENT_DOMAIN`, `CLIENT_URL`, `SENTRY_ORG`, `SENTRY_DSN_BACKEND`, `SENTRY_DSN_FRONTEND`, `ALGOLIA_APPLICATION_ID`, `ALGOLIA_SEARCH_API_KEY`, `ALGOLIA_INDEX_DOCS`

## Decision-Log

- feat: review + fix build_and_deploy CI
    - fix: `GITHUB_PATH` collided w/ GH-reserved env (runner PATH-mutation file) → rename `GHCR_REPO` across mise.toml, docker.mise.toml, py script, all Dockerfiles
    - fix: missing `environment:` on job → env-scoped `secrets`/`vars` never resolved; added `environment: ${{ inputs.target_deploy_env }}`
    - fix: dropped dead `options:` + `default: prod` from workflow_dispatch input (ignored when `type: environment`; bad default `prod` ≠ `pg/prod`)
    - fix: missing env passthrough for `mise docker:build` (DJANGO_ENV, SENTRY_*, domains, ALGOLIA_*, VITE_SITE) → wired via `vars.*`/`secrets.*` in job `env:`
    - fix: digests step `shell: nu {0}` lost mise env → switched to bash + `eval "$(mise env --shell bash)"`; also uses `${GHCR_REPO}`
    - fix: `Dockerfile ARG GHCR_REPO` was never passed via compose `args:` → added; fixes empty `image.source` LABEL
    - bump: `jdx/mise-action@v3→v4`, `docker/login-action@v3→v4`
    - kept: `actions/checkout@v6` OK, `attest-build-provenance@v3` OK (v4 is wrapper)
    - tradeoff: rename leaks beyond CI (local devs must `mise install` after pull) — accepted to remove footgun for future contributors
