## NeuronHub - Privacy-First Tech Expertise Sharing

- Architecture: Clean Django + React SPA, GraphQL boundary  
- Constraints: Avoid Facebook patterns (complex state, microservices), prefer simple maintainable solutions  
- Testing: Outside-in TDD, London school, `test_gen.py` factories  
- Keywords: Fat models thin views, composition over inheritance, fail fast, explicit over implicit

@./docs/architecture.md

## Workflow Overview

### Development Workflow

You MUST follow this workflow for any task.

1. Read & Understand - understand domain, grep codebase 
2. Architect Solution - identify affected models, services, UI components  
3. Plan Implementation - TodoWrite tool, break into testable units
4. Write Failing Tests - eg use `test_gen.py`, or write units/playwright 
5. Red-Green-Refactor - `uv run pytest` until green, then refactor
6. Integration Verification - run pytest again, type check, format
   - `./.run/mypy.sh`
   - `./.run/gen-types-and-format.sh`

You MUST test everything by `uv run pytest` and `mypy` before finishing any task.

### Commands

- Models changes: migrate → gen graphql types → test
- `./.run/gen-types-and-format.sh` - includes: Ruff, root `/schema.graphql` gen, graphql-codegen, gql-tada, and Biome
- `uv run manage.py migrate`
- `uv run manage.py db_stubs_repopulate --is_delete_tools` - idempotent, a full db state reset with test data. But keeps the default User and his cookie session.
- `uv run pytest`
- `uv lock --upgrade`

Remember to run `uv` scripts from `server/` dir, and `./.run/` files from the root dir.

### Patterns

- Django: Apps store domain in `models.py`, business logic in `services.py`, API in `graphql/`. Avoid god objects.
- React: Compound components, lift state up (ideally one Valtio per page), single responsibility  
- Testing: Arrange-Act-Assert, Given-When-Then, test behavior not implementation
- Database: Normalize then denormalize, foreign keys over joins

### Avoid

- React: useState hell, prop drilling, premature optimization, god components
- Django: fat views, ORM in templates, circular imports
- GraphQL: resolver soup, client caching complexity
- Testing: non-maintainable code, mocking everything, flaky tests, testing implementation details
- CORS issues: BE + FE 100% have no CORS issues 
- Playwright: excessive `wait_for_timeout()` - use proper locators and state checks instead

@./client/README.md

@./docs/testing-setup.md

@./docs/code-style.md
