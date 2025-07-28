### CLI commands

- You MUST always use mise.toml tasks - they have all commands, configs, args, etc.
- `mise lint` - Mypy, TSC
- `mise format`- Ruff, Biome
- `mise pytest` - all tests; can pass tests as args
- `mise e2e` - ie `bun run playwright test` with Chromium
- `mise graphql-gen` - root `/schema.graphql` generation, graphql-codegen, gql-tada
- `mise typegen` - react-router, chakra theme
- `mise db-migrate`
- `mise db-stubs-repopulate` - idempotent db reset with the stub data. Keeps the `admin` User and his cookie session.
- Useful shell utils: rg, fd, bat, jq, delta, exa
- Use Fish shell. Bash available.
