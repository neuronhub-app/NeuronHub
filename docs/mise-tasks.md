`mise.toml` is the single source of truth of configuration.

### Tasks

- `mise pytest` - server/ pytest only
    - You must remember that by default it excludes `uv run pytest -m not slow_llm_api and not firebase_subscription`. When you need to test those 2 scopes you can run `test:pytest:all`
- `mise e2e` - Playwright on client/. It starts its own Django and Vite server. You can only pass test cases to run - never add flags as `headless`.
- `mise e2e:docs` - on docs/e2e.
- `mise lint` - cached to be used all the time. It runs:
    - `mise format` - Ruff, Biome
    - `mise typegen` - Strawberry → schema.graphql → TS enums; gql.tada Persisted Queries (backend whitelist); @chakra-ui; etc
    - `mise lint:server` - mypy
    - `mise lint:client` - Biome and tsgo
- `mise django:migrate`
- `mise django:makemigrations`
- `mise django:db-stubs-repopulate`
