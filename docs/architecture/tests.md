We use `pytest` for unit tests, and `playwright` in `client/e2e`.

The biggest issues are:
1. The fucking maintenance cost.
2. The dev workflow feedback slowdown from low quality tests.

Tests will speed up coding, but only when written using a highly maintainable framework, focused on our business logic.

Create low-quality temporarily pytest or Playwright cases when it helps. Make sure to clean up afterwards.

Never leave third-party libraries tests in the codebase (Strawberry, GraphQL, etc).

## Mandatory task-specific docs

- [How to use pytest](./backend/pytest.md)
- [How to use Playwright](./frontend/Playwright.md)
