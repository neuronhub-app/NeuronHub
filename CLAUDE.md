## NeuronHub - Privacy-First Tech Expertise Sharing

<doc-architecture>

@./docs/architecture.md

</doc-architecture>


<doc-roadmap>

@./docs/ROADMAP.md

</doc-roadmap>

### Workflow

Mise commands:
- `mise lint` - is cached to be used all the time. It runs:
  - `mise format` - Ruff, Biome
  - `mise typegen` - Strawberry Django -> schema.graphql -> TypeScript enums
  - `mise lint:server` - mypy
  - `mise lint:client` - Biome and `tsc`
- `mise pytest` - server/ only
- `mise e2e` - runs Playwright, and manages its own Django and Vite servers
  
Mise Django commands:
- `mise django:migrate`
- `mise django:makemigrations`
- `mise django:db-stubs-repopulate`

You're never going to be able to run Django or Vite dev servers. Only Mise config is capable of it.
