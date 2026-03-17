---
paths:
  - "e2e/**/*"
---

## Playwright

In E2E we test only the critical user journeys. Or the cases with the lowest possible maintenance cost. Everything else is stupid time waste.

Specs are stored in `client/e2e/tests`.

Notes:
- If e2e needs timeouts as `waitForTimeout` - it is trash and must be rewritten.
- Use `data-testid` for locators, in JSX set with `{...ids.set(ids.post.btn.submit)}` - see `client/e2e/ids.ts`
- For auth we use Django `/admin/login/` and cookies - CORS 100% works.

### PlaywrightHelper.ts

A wrapper for bad Playwright API, its methods:
- `.screenshot(name: str, { fullPage = false, maxH = 3000 })`: saves to `e2e/screenshots/`
- `.graphqlQuery`: uses `this.page.request.post` as we can't use `client.query` in e2e.
- `.waitForResponseGraphql(query: TadaDocumentNode<TData>): Promise<{ data: TData }>`: can await mutations/queries to avoid `waitForNetworkIdle`.
- `.fill(id: str, contnet: str)`: input waitFor, clear, fill. 
- `.navigate`: goto and waitForNetworkIdle
- `.setDefaultTimeout`: calls `page.setDefaultTimeoput` and _some_ of waitForNetworkIdle. Will be improved later.
- `.$[ids.value]`: calls `page.getByTestId(ids.value).first()`

You must never use magic strings, instead:
- if it's used 2+ times -> declare a `const` or an object eg as `const user = { email: ..., username: ... }`.
- if it's a text from a Component indicating action status (eg added/removed/error) -> add `ids.set(condition ? ids.value.active : ids.value.inactive)` -> check it with `expect(ids.value).toBeVisible()`.

### `e2e/helpers/expect.ts`

Replaces:
- `.toHaveAttribute("data-state", true)` -> `except($[ids.value]).checked(locator)`
- `.localor(text="{value}")` -> `epxect(page).toHaveText`

### Mise

- `mise e2e`: Django and Vite Mise servers are managed by Playwright from `playwright.config.ts`. Already `headless` - never modify browser CLI params.
- `devops/e2e.mise.toml`: contains `dev:e2e:server`, `dev:e2e:server:db_worker`, etc
- `devops/db.mise.toml`: contains `dev:db:e2e:setup` and `dev:db:e2e:rm`

### Examples

Clean example: [[vote-and-reading-list.spec.ts]].
