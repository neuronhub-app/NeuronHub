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

## Mandatory task-specific docs

- [How to use pytest](./backend/pytest.md)
- [How to use Playwright](./frontend/Playwright.md)
