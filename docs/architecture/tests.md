---
paths:
  - "**/*__test.py"
  - "**/test_*.py"
  - "client/e2e/**/*"
---

We use `pytest` for unit tests, and `playwright` in `client/e2e`.

We must use red/green TDD.

The biggest test's issues are:
1. The fucking maintenance cost: quality != quantity.
2. The clean and readable tests are more important than the code.
3. The dev workflow feedback slowdown from redundant tests.

Tests speed up development, but only when focused on the core business logic, and written using highly maintainable frameworks - eg our `test_gen.py` and `PlaywrightHelper.ts`.

It's ok to create low-quality temporarily pytest or Playwright cases for TDD - make sure to remove them afterwards.

Never leave third-party libraries tests in the codebase (Strawberry, GraphQL, etc).

## Test data: `test_gen`, `db_stubs_repopulate`, `{app}/tests/db_stubs`

- `apps/tests/test_gen.py::Gen` - faker factories mostly for pytest. Start by reading its headers as the file is 600+ LOC, then the specific sections you need.
- `apps/tests/services/db_stubs_repopulate.py` - seeds dev DB and E2E DB.
- `{app}/tests/db_stubs.py` - in April we started refactoring `db_stubs_repopulate` (600+ LOC) into app-specific files. WIP - ATM implemented only for `jobs`.

## Mandatory task-specific docs

- [How to use pytest](./backend/pytest.md)
- [How to use Playwright](./frontend/Playwright.md)
