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
- [x] make FE modular for PG deployment (jobs.probablygood.org)
    - scope: single `sites/pg/` dir with custom layout+theme, reusing shared components
    - 3 months target: NPM package `neuronhub` + `neuronhub-template` repo (out of scope now)
- [ ] JobAlert email:
    - [x] open Job by .slug for email alerts: query by GraphQL -> put on the top of Algolia results.
    - [x] Add FE `/jobs/subscriptions/remove/<.id_ext>` that removes the alert using GraphQL and:
        - show /jobs/subscriptions/ + place on top a closable `<Alert/>` saying that it was removed

## Exec-Plan

<LLM_unverified_report>

### Current state
The unsubscribe feature works end-to-end (3/3 e2e tests pass: subscribe+toggle+remove, unsubscribe-success, unsubscribe-error).

### What was done
1. **BE** (`server/neuronhub/apps/jobs/graphql.py:148-158`): `job_alert_unsubscribe` now raises `StrawberryGraphQLError("Subscription not found")` instead of `return False` when alert not found. This is the first usage of GraphQL errors in this codebase.
2. **FE** (`client/src/apps/jobs/subscriptions/JobAlertList.tsx:34-104`): The unsubscribe UI uses `useInit` + `mutateAndRefetchMountedQueries` with a closable `<Alert.Root>` that shows 3 states:
   - Loading: `status="info"` with `<Alert.Indicator><Spinner size="sm" /></Alert.Indicator>` + "Unsubscribing..."
   - Success: `status="success"` with `<Alert.Indicator />` (default icon) + "Unsubscribed."
   - Error: `status="error"` with `<Alert.Indicator />` (default icon) + error message from BE
3. **E2E** (`client/e2e/tests/job-list.spec.ts:78-108`): Two unsubscribe tests — success path (create alert, visit remove URL, assert "Unsubscribed." + Inactive badge) and error path (bogus UUID, assert "Subscription not found").
4. **Route** (`client/src/apps/jobs/subscriptions/remove.tsx`): Thin route that passes `removeIdExt` prop to `JobAlertList`.

### What needs to be done next
CTO wants the unsubscribe logic (lines 37-74 + the Alert JSX at lines 78-104) extracted from `JobAlertList` into a new `JobUnsubscribeRequestStatus` component. This means:
- Extract state (`isUnsubscribeRequest`, `unsubscribeError`), `useInit` hook, `unsubStatus` derivation, and the `<Alert.Root>` block into `JobUnsubscribeRequestStatus(props: { removeIdExt?: string })`
- `JobAlertList` renders `<JobUnsubscribeRequestStatus removeIdExt={props.removeIdExt} />` at the top of the Stack
- `remove.tsx` may render `<JobUnsubscribeRequestStatus>` + `<JobAlertList>` separately, or keep passing the prop through — CTO to decide
- The `JobAlertUnsubscribeMutation` graphql definition stays in `JobAlertList.tsx` (or moves with the new component)

### Chakra Alert.Indicator pattern (important)
- `<Alert.Indicator />` with **no children** → renders the default status icon (checkmark, error icon, etc.)
- `<Alert.Indicator><Spinner size="sm" /></Alert.Indicator>` with children → overrides with Spinner
- Do NOT pass `{false}` or `{condition && <Spinner/>}` as children — it suppresses the default icon. Use a ternary with two separate `<Alert.Indicator>` elements.

</LLM_unverified_report>

## Thinking-Log

