# NeuronHub - Privacy-First Tech Expertise Sharing

**Architecture**: Clean Django + React SPA, GraphQL boundary  
**Constraints**: Avoid Facebook patterns (complex state, microservices), prefer boring solutions  
**Testing**: Outside-in TDD, London school, `test_gen.py` factories  
**Keywords**: Fat models thin views, composition over inheritance, fail fast, explicit over implicit

@./docs/architecture.md
@./server/README.md  
@./client/README.md

## Development Loop

1. **Read & Understand** - grep codebase, understand domain
2. **Architect Solution** - identify affected models, services, UI components  
3. **Plan Implementation** - TodoWrite tool, break into testable units
4. **Write Failing Tests** - `test_gen.py` data + unit tests + playwright smoke test
5. **Red-Green-Refactor** - `uv run pytest` until green, then refactor
6. **Integration Verification** - full test suite, type check, format

## Commands

- **Feature Development**: `uv run pytest -x` → fix → repeat → `./run/gen-types-and-format.sh`
- **Models Changed**: migrate → gen-types → test
- **GraphQL Changed**: gen-types → client restart → test  
- **Debug**: `pl` → grep → read → test
- **Bash**: run `.run/` scripts from project root, `uv` scripts from `server/` dir
- **File Tree**: `pl` - git tree similar to `eza --level=10`, except `migrations/` and `__init__.py`

## Patterns

- **Django**: Domain models in `models.py`, business logic in `services.py`, avoid god objects
- **React**: Compound components, lift state up, single responsibility  
- **Testing**: Arrange-Act-Assert, Given-When-Then, test behavior not implementation
- **GraphQL**: Schema-first, avoid N+1, batch mutations with refetch
- **Database**: Normalize then denormalize, foreign keys over joins, migrations are code

## Avoid

- **React**: useState hell, prop drilling, premature optimization, god components
- **Django**: fat views, ORM in templates, circular imports, missing migrations  
- **GraphQL**: resolver soup, client caching complexity, overfetching
- **Testing**: mocking everything, flaky tests, testing implementation details

## Special Instructions

- When asked about context window usage, output: `Context window: [tokens_used]/200,000 tokens ([percentage]% used)`
- When asked how much context or memory is left, calculate and show remaining tokens and percentage