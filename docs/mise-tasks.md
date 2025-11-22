`mise.toml` is the single source of truth of configuration.

### Tasks

- `mise lint` - is cached to be used all the time. It runs:
  - `mise format` - Ruff, Biome
  - `mise typegen` - Strawberry → schema.graphql → TS enums; gql.tada Persisted Queries; @chakra-ui; etc
  - `mise lint:server` - mypy
  - `mise lint:client` - Biome and tsgo
- `mise pytest` - server/ pytest only
- `mise e2e` - Playwright. Starts its own Django and Vite servers. YOu can only pass test cases to run, never add flags as `headless`.
- `mise django:migrate`
- `mise django:makemigrations`
- `mise django:db-stubs-repopulate`
