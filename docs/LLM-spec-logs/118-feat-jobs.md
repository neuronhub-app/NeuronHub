## Desc

We're creating the new app `jobs`, taking `profiles` as the base, and importing the data from the real CSV of `.local/pg-jobs.csv` and `pg-orgs.csv`.

The basic BE and FE works. Still a week worth of work, but we'll handle it one task at a time.

### `apps.jobs` files

- models.py - `Job`, `JobAlert`
- index.py
- graphql.py
- services/csv_import.py
- tests/db_stubs.py

FE
- apps/jobs/list/JobList.tsx
- apps/jobs/list/JobsSubscribeModal.tsx
- apps/jobs/list/JobCard/JobCard.tsx
- apps/jobs/subscriptions/JobAlertList.tsx
- components/algolia/AlgoliaFacetSalary.tsx
- e2e/tests/job-list.spec.ts

### Tasks
- [x] copy FE of `profiles` into `jobs`
- [x] dedup Algolia Facets of `profiles`, `jobs`, `reviews`, `tools`
- [x] import CSV into job.Jobs & orgs.Org
- [x] `JobAlert`
    - [x] save active facets to `JobAlert.tags`
    - [x] on creation - set a Django Session value (expire 1y) to show User in `<LayoutSidebar>` his "Subscriptions" 
- [x] /jobs/subscriptions/
    - [x] GraphQL and UI to toggle `.is_active` true/false
    - [x] show facet attribute custom labels on `JobAlert` modal
- [x] add a `.salary_min` facet
    - [x] save `.salary_min` to `JobAlert`
- [x] S3 Cloudflare R2
- [x] add `db_stubs.py` for `jobs` and `profiles`; drop CSV usage in db_stubs_repopulate
- [ ] make FE modular for PG deployment (jobs.probablygood.org)
    - scope: single `sites/pg/` dir with custom layout+theme, reusing shared components
    - 3m target: NPM package `neuronhub` + `neuronhub-template` repo (out of scope now)

<LLM_plan>

## Exec-Plan

Approach: **Route-level layouts (Proposal B)** — [detailed plan](./118-fe-modularity-plan.md)

1. Add `VITE_SITE` env var
2. Refactor `root.tsx` → providers-only + `<Outlet />`; theme via `sites/index.ts`
3. `sites/neuronhub/NeuronLayout.tsx` wraps existing `LayoutContainer`; `sites/neuronhub/routes.ts` = current routes in `layout(NeuronLayout)`
4. `sites/pg/`: `theme.ts`, `PgLayout.tsx` (header + Outlet), `routes.ts` (jobs-only in `layout(PgLayout)`)
5. Main `routes.ts` → dispatcher: `VITE_SITE === "pg" ? pgRoutes : nhaRoutes`
6. ErrorBoundary → generic (no sidebar shell)

## Thinking-Log

- Analyzed all jobs app imports: JobCard is pure, JobList/Subscribe need Apollo, AlertList is fully auth-gated
- PG still needs NHA backend (Algolia key + enrichment queries via GraphQL)
- Route file paths in `route()` resolve relative to `appDirectory` regardless of caller location
- Rejected: Vite aliases (magic), appDirectory switch (fragile `../../` paths), runtime hostname (leaks site-awareness into components)
- Chose B over A: NHA disruption is fine, B gives cleaner architecture + best NPM migration path

## Approach

Refactor `root.tsx` to be site-agnostic (providers + `<Outlet />`). Each site provides its own layout via React Router's `layout()` in routes. Site selection at build time via `VITE_SITE` env var.

## Architecture

```
root.tsx                    # providers + <Outlet /> (no LayoutContainer)
routes.ts                   # dispatches: VITE_SITE → sites/{site}/routes.ts
sites/
  index.ts                  # exports siteTheme based on VITE_SITE
  neuronhub/
    routes.ts               # all current routes, wrapped in layout(NeuronLayout)
    NeuronLayout.tsx            # export default → <LayoutContainer />
  pg/
    routes.ts               # jobs-only routes, wrapped in layout(PgLayout)
    PgLayout.tsx             # PG header + <Outlet /> (no sidebar, no auth)
    theme.ts                 # PG brand colors, extends base
```

Route tree after refactor:
```
root.tsx (App → AppProviders → Outlet)
  └── NeuronLayout (LayoutContainer with sidebar)
        ├── /              → home
        ├── /jobs          → JobList
        ├── /profiles      → ProfileList
        └── ... all NHA routes

  └── PgLayout (PG header, no sidebar, no auth)
        ├── /              → JobList (reused from @/apps/jobs/)
        └── /subscriptions → JobAlertList
```

## Steps

### 1. Add `VITE_SITE` to env.ts
```ts
VITE_SITE: str({ default: "", choices: ["", "pg"] }),
```

### 2. Create `sites/index.ts` - theme dispatcher
```ts
import { system } from "@/theme/theme";
import { pgSystem } from "@/sites/pg/theme";
export const siteTheme = import.meta.env.VITE_SITE === "pg" ? pgSystem : system;
```

### 3. Refactor `root.tsx`
- `App` → `<AppProviders><Outlet /></AppProviders>` (drop LayoutContainer)
- `AppProviders` uses `siteTheme` from `sites/index.ts`
- `ErrorBoundary` → generic error display (no sidebar shell)
- `Layout` (HTML shell) stays unchanged

### 4. Create `sites/neuronhub/NeuronLayout.tsx`
```tsx
import { LayoutContainer } from "@/components/LayoutContainer";
export default function NeuronLayout() {
  return <LayoutContainer />;
}
```

### 5. Create `sites/neuronhub/routes.ts`
Cut-paste current routes from `routes.ts`, wrap in `layout("./sites/neuronhub/NeuronLayout.tsx", [...])`.

### 6. Create `sites/pg/theme.ts`
Extend base theme with PG brand colors. Override `colorPalette`, logo token, semantic color tokens.

### 7. Create `sites/pg/PgLayout.tsx`
Simple header with PG logo + `<Outlet />`. No sidebar, no auth, no LayoutSidebar.

### 8. Create `sites/pg/routes.ts`
```ts
export default [
  layout("./sites/pg/PgLayout.tsx", [
    route("/", "./apps/jobs/list/index.tsx"),
    route("/subscriptions", "./apps/jobs/subscriptions/index.tsx"),
  ]),
] satisfies RouteConfig;
```
Route file paths resolve relative to `appDirectory` (src/), so `./apps/jobs/...` works from any file.

### 9. Update main `routes.ts` - dispatcher
```ts
import neuronRoutes from "./sites/neuronhub/routes";
import pgRoutes from "./sites/pg/routes";
export default (process.env.VITE_SITE === "pg" ? pgRoutes : neuronRoutes) satisfies RouteConfig;
```

### 10. ErrorBoundary update
Current ErrorBoundary wraps `<AppProviders><LayoutContainer>`. After refactor, render generic error page without sidebar (works for both sites).

## Key decisions

- **PG still uses Apollo**: jobs enrichment query (`JobsByIds`) + Algolia key are fetched via GraphQL. PG's backend is NHA's backend.
- **Route paths are appDirectory-relative**: `route("/", "./apps/jobs/list/index.tsx")` always resolves to `src/apps/jobs/list/index.tsx` regardless of which file calls `route()`.
- **PG overrides a component**: replace the route file path with a PG-specific file, or wrap the shared component in PG's own thin wrapper.
- **NPM migration path**: `sites/pg/` structure maps to what a `neuronhub-template` consumer would write. When packaging, `@/` imports become `neuronhub` package imports.

## Jobs app coupling (from dependency analysis)

| File                   | Algolia | Apollo/GQL       | Auth                      |
|------------------------|---------|------------------|---------------------------|
| JobCard.tsx            | Yes     | No (type only)   | No                        |
| JobList.tsx            | Yes     | Yes (enrichment) | No                        |
| JobsSubscribeModal.tsx | Yes     | Yes (mutation)   | Optional (email pre-fill) |
| JobAlertList.tsx       | No      | Yes (3 ops)      | Yes (fully gated)         |

PG reuses all 4 as-is. `useUser()` returns null when not logged in → subscribe modal falls back to localStorage email. `JobAlertList` shows empty state for anonymous users (acceptable for now).

</LLM_plan>