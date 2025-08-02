### CLI commands

- You MUST use `mise.toml` tasks - it has dirs, args, configs, etc.
- `mise lint` - Mypy, TSC
- `mise format`- Ruff, Biome
- `mise test:pytest` - all tests; can pass tests as args
- `mise test:e2e` - ie `bun run playwright test` with Chromium
- `mise typegen` - GraphQL from Strawberry, gql-tada, react-router, Chakra theme
- `mise django:migrate`
- `mise django:stubs-repopulate` - idempotent reset with stub data. Keeps the `admin` User cookie session.
- Shell utils: rg, fd, bat, jq, delta, exa
- Use Fish. Bash available.
