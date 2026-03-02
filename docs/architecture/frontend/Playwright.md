---
paths:
  - "e2e/**/*"
---

## Playwright

In E2E we test only the critical user journeys. Or the cases with the lowest possible maintenance cost. Everything else is stupid time waste.

Specs are in `client/e2e/tests`.

Notes:
- If code needs timeouts as `waitForTimeout` - it is shit and must be rewritten.
- `client/e2e/helpers/PlayWrightHelper.ts` is wrapper for bad Playwright API.
- `client/e2e/helpers/expect.ts` adds `epxect(page).toHaveText → localor(text="$")` and `page.toHaveChecked → toHaveAttribute("data-state", $)`
	- read if it you're adding E2E tests.
- Use `data-testid` for locators, in JSX set as `{...ids.set(ids.post.btn.submit)}`, see `client/e2e/ids.ts`
- Auth is by Django `/admin/login/` and cookie - CORS 100% works.

### Mise
- Run by `mise test:e2e` - Django and Vite are run by Playwright through `playwright.config.ts`. Never use `headless` flag.
- `dev:e2e:server`, `dev:e2e:server:db_worker` and others are in `devops/e2e.mise.toml`
- `dev:db:e2e:setup` and `dev:db:e2e:rm` are in `devops/db.mise.toml`
