`mise.toml` is the single source of truth of configuration.

### Tasks

- `mise pytest` - server/ pytest only
    - You must remember that by default it runs with `uv run pytest -m not slow_llm_api and not firebase_subscription`. And to not skip anything you need to run it as `mise pytest -m ""`
- `mise e2e` - Playwright. Starts its own Django and Vite servers. You can only pass test cases to run, never add flags as `headless`.
- `mise lint` - is cached to be used all the time. It runs:
    - `mise format` - Ruff, Biome
    - `mise typegen` - Strawberry → schema.graphql → TS enums; gql.tada Persisted Queries; @chakra-ui; etc
    - `mise lint:server` - mypy
    - `mise lint:client` - Biome and tsgo
- `mise django:migrate`
- `mise django:makemigrations`
- `mise django:db-stubs-repopulate`
- `mise django:algolia-reindex`
