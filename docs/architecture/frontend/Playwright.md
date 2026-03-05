---
paths:
  - "e2e/**/*"
---

## Playwright

In E2E we test only the critical user journeys. Or the cases with the lowest possible maintenance cost. Everything else is stupid time waste.

Specs are stored in `client/e2e/tests`.

Notes:
- If e2e needs timeouts as `waitForTimeout` - it is trash and must be rewritten.
- `client/e2e/helpers/expect.ts`: replaces `localor(text="<nonce>") -> epxect(page).toHaveText` and `toHaveAttribute("data-state", <nonce>) -> except.checked(locator)`
- Use `data-testid` for locators, in JSX set as `{...ids.set(ids.post.btn.submit)}`, see `client/e2e/ids.ts`
- For auth we use Django `/admin/login/` and cookies - CORS 100% works.

### PlaywrightHelper.ts

A wrapper for bad Playwright API, its methods:
- `.screenshot(name: str, { fullPage = false, maxH = 3000 })`: saves to `e2e/screenshots/`
- `.graphqlQuery`: uses `this.page.request.post` as we can't use `client.query` in e2e.
- `.fill(id: str, contnet: str)`: input waitFor, clear, fill. 
- `.navigate`: goto and waitForNetworkIdle
- `.setDefaultTimeout`: calls `page.setDefaultTimeoput` and _some_ of waitForNetworkIdle. Will be improved later.

### Mise

- `mise e2e`: Django and Vite Mise servers are managed by Playwright from `playwright.config.ts`. Already `headless` - never modify browser CLI params.
- `devops/e2e.mise.toml`: contains `dev:e2e:server`, `dev:e2e:server:db_worker`, etc
- `devops/db.mise.toml`: contains `dev:db:e2e:setup` and `dev:db:e2e:rm`
