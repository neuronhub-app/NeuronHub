## NeuronHub - Privacy-First Tech Expertise Sharing

- Architecture: Clean Django, React SPA, GraphQL boundary
- Testing: Outside-in TDD, London school, `test_gen.py` factories
- Approach: composition over inheritance, fail fast, explicit over implicit, avoid Facebook patterns (complex state, microservices), prefer simple maintainable solutions

@./docs/architecture.md

### CLI commands

- `uv run pytest`
- `uv run manage.py migrate`
- `uv run manage.py db_stubs_repopulate` - idempotent, a full db state reset to the stub data. Keeps the default `admin` User and his cookie session.
- `mise graphql-gen` - executes: Ruff, root `/schema.graphql` generation, graphql-codegen, gql-tada, Biome.
- Shell utils: rg, fd, bat

Remember to run `uv` scripts from `server/` dir

### Structure

- Django: Apps store domain in `models.py`, business logic in `services.py`, API in `graphql/`. Avoid god objects.
- React: Compound components, lift state up (ideally one Valtio per page), single responsibility  
- Testing: Arrange-Act-Assert, Given-When-Then, test behavior not implementation
- Database: Normalize then denormalize, foreign keys over joins

### Avoid

- React: useState hell, prop drilling, premature optimization, god components
- GraphQL: resolver soup, client caching complexity
- Tests: non-maintainable code, mocking everything, flaky tests, testing implementation details, magic strings

@./docs/client-caveats.md

@./docs/testing-setup.md

@./docs/code-style.md
