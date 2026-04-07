## Desc

Review + fix regressions from #145 (`42c04a5b`) — salary filter Valtio refactor.

#### 1. FE regressions from stale rebase

`c699e5ae` (Apr 1) removed `extraTags`/`isExtraActive`/`onClearAdditional`
from shared `PgAlgoliaFacetsActive` and `PgAlgoliaFilterCard`.
`42c04a5b` re-introduced them — stale rebase artifact.

Fix:
- Revert `extraTags`, `onClearAdditional`, `isExtraActive` from `PgAlgoliaFacetsActive.tsx` and `PgAlgoliaFilterCard.tsx` back to `c699e5ae` state
- Move salary active-tags rendering + clear-all into `JobList.tsx` scope
- Keep `jobListFilters.ts` Valtio module (temporary, see §3)

#### 2. Dead code + minor bugs

- Remove `has_salary: "Has Salary"` from `JobList.tsx:74` labelsOverride — toggle no longer exists
- `ResetFiltersButton` (JobList.tsx:143): add Valtio salary check so it renders when only salary filters active

#### 3. Mark Valtio salary logic for removal — #quality-25%

The entire `jobListFilters.ts` Valtio approach exists solely because
the product spec requires "include no-salary jobs when salary filter is active."
This is wrong UX — "show me jobs >= 50k" should not show unknown-salary jobs.

The correct fix (pending approval):
- Set `salary_min=0` in DB for no-salary jobs (already done for Algolia via `get_salary_min_or_zero`)
- Keep native Algolia `useRange` / refinement hooks for salary
- "Exclude no salary" = `useToggleRefinement` on `has_salary` (existed before #145 removed it)
- Drop: `jobListFilters.ts`, `extraTags`/`onClearAdditional` in shared facets, `<Configure filters={...}>` string building, Valtio salary state in subscribe modals

This eliminates ~80% of #145's FE complexity.

Add to affected files:
- `jobListFilters.ts` top: `// #quality-25% #155 — Valtio salary workaround for "include no-salary" UX. Remove when salary_min=0 in DB (pending product decision).`
- `PgFacetSalary.tsx` top: `// #quality-25% #155 — see jobListFilters.ts`
- Salary-related code in `JobsSubscribeModal.tsx` (PG): `// #155`
- Salary Valtio wiring in `JobList.tsx`: `// #155`

### Tasks

- [x] Revert shared facets to `c699e5ae` state (remove extraTags/isExtraActive/onClearAdditional)
- [x] Removed extraTags wiring from JobList.tsx, replaced with `useJobListSalaryIsActive`
- [x] Remove dead `has_salary` label from JobList.tsx
- [x] Fix ResetFiltersButton visibility for Valtio-only filters
- [x] Add `#quality-25% #155` comments to Valtio salary files
- [x] `mise lint`
- [x] `mise pytest`
- [x] `mise e2e`

## Exec-Plan

#### Review fixes

- [x] Restore `extraTags`/`onClearAdditional` in `FacetsActiveConfig`, `useJobListExtraTags` in jobListFilters.ts, wire from JobList.tsx
- [x] Thread `onClearAdditional` to `PgRefinesClearButton` so "Clear all" resets Valtio salary
- [x] Remove redundant `useJobListSalaryIsActive()` call in JobList component root
- [x] Remove unnecessary `!` assertion on `clearTimeout` in PgFacetSalary.tsx

## Decision-Log

- Restore `extraTags`/`onClearAdditional` in shared `FacetsActiveConfig` ← needed for Valtio salary tags display + clear-all
    - Salary tag creation stays in `jobListFilters.ts` (JobList scope), shared components stay generic
