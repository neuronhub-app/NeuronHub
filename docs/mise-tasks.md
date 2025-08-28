`mise.toml` is the single source of truth re configuration

### Tasks

- `mise lint` - is cached to be used all the time. It runs:
  - `mise format` - Ruff, Biome
  - `mise typegen` - Strawberry Django -> schema.graphql -> TypeScript enums + gql.tada + react-router
  - `mise lint:server` - mypy
  - `mise lint:client` - Biome and `tsc`
- `mise pytest` - server/ only
- `mise e2e` - runs Playwright, and manages its own Django and Vite servers
  
Django:
- `mise django:migrate`
- `mise django:makemigrations`
- `mise django:db-stubs-repopulate`
