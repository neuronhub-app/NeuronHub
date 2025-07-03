## NeuronHub - Privacy-First Tech Expertise Sharing

- Architecture: Clean Django, React SPA, GraphQL boundary
- Testing: Outside-in TDD, London school, `test_gen.py` factories
- Approach: composition over inheritance, fail fast, explicit over implicit, avoid Facebook patterns (complex state, microservices), prefer simple maintainable solutions

@./docs/architecture.md

### Workflow

You MUST work using your given `docs/private/project-management/**/*.md` Task MD file.

Read the template:
```markdown
@./docs/private/project-management/task-template.md
```

You MUST create a checklist based on the structure below to make sure the Task MD file is fully ready for execution.
- [ ] Use a subagent to think ultra hard about the architecture and add/update [#Architecture]
  - understand domain, grep codebase, identify affected models, services, UI components
- [ ] Use a subagent to think ultra hard re how to fully complete it and add/update [#Execution Plan]
Preparation
- [ ] Run test, document failures (if any)
- [ ] Write few TDD tests, confirm they fail.
- [ ] Use a subagent to review your tests and update the Task MD file.
- [ ] Use Todo tool to document the implementation in testable units.
Implementation - start adding code to make your tests pass. Keep your Todo tool in sync with the Task MD file.
- [ ] 25% progress: Use a subagent to review and update the Task MD file.
- [ ] 50% progress: Use a subagent to review and update the Task MD file.
- [ ] 75% progress: Use a subagent to review and update the Task MD file.
- [ ] 75% progress: Use a subagent to review and update the Task MD file.
- [ ] 100% progress: Use a subagent to review and update the Task MD file. Test everything with `uv run pytest`.
- [ ] Use a subagent to review your changes and:
  - Think ultra hard whether it meats the requirements.
  - Review and update the Task MD file.
  - Fix the found problems.
- [ ] Use a subagent to review your changes.
- [ ] Think hard about the tradeoffs you made and update the Task MD file.

### CLI commands

- `uv run pytest`
- `uv run manage.py migrate`
- `uv run manage.py db_stubs_repopulate` - idempotent, a full db state reset to the stub data. Keeps the default `admin` User and his cookie session.
- `./.run/gen-types-and-format.sh` - executes: Ruff, root `/schema.graphql` generation, graphql-codegen, gql-tada, Biome.

Remember to run `uv` scripts from `server/` dir, and `./.run/` files from the root dir.

### Structure

- Django: Apps store domain in `models.py`, business logic in `services.py`, API in `graphql/`. Avoid god objects.
- React: Compound components, lift state up (ideally one Valtio per page), single responsibility  
- Testing: Arrange-Act-Assert, Given-When-Then, test behavior not implementation
- Database: Normalize then denormalize, foreign keys over joins

### Avoid

- React: useState hell, prop drilling, premature optimization, god components
- GraphQL: resolver soup, client caching complexity
- Tests: non-maintainable code, mocking everything, flaky tests, testing implementation details
- CORS: BE and FE 100% have no CORS issues 
- Playwright: no `wait_for_timeout()` - use locators and state checks instead

@./docs/client-caveats.md

@./docs/testing-setup.md

@./docs/code-style.md
