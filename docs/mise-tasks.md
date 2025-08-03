---
reviewed_at: 2025.08.02
---

## Mise Tasks

- You must use `mise.toml` tasks, it's the single source of truth re configuration
- `mise lint` - `mise typegen`, Mypy, TSC
  - `mise typegen` - Django's schema.graphql, graphql-codegen, gql-tada, react-router
- `mise format`- Ruff, Biome
- `mise test:pytest` - all python tests; you can pass tests as args
- `mise test:e2e` - runs Playwright on `client/e2e/tests`
- `mise django:stubs-repopulate` - idempotent reset with stub data. Keeps the `admin` User cookie session.
- `mise django:migrate`
- Shell utils: rg, fd, bat, jq, delta, exa
- Use Fish. Bash available.
