/**
 * Reverse map: a stored JobAlert → Algolia `IndexUiState`, for on-page editing.
 *
 * Shares tag+location mapping with [[landingPageToAlgoliaState.ts]] via
 * [[algoliaJobTagRefinements]]. Differences vs the landing-page map:
 * - alerts also carry the `is_exclude_*` toggles (landing pages v1 omit both).
 * - salary lives in the PG Valtio [[jobListFilters.ts]], not Algolia => returned separately.
 */
import type { IndexUiState } from "instantsearch.js";

import type { JobAlertListQuery } from "@/apps/jobs/subscriptions/JobAlertList";
import type { ResultOf } from "@/gql-tada";
import { buildJobTagRefinements } from "@/sites/pg/pages/jobs/algoliaJobTagRefinements";

type Alert = NonNullable<ResultOf<typeof JobAlertListQuery>["job_alerts"]>[number];

export function alertToAlgoliaState(alert: Alert): {
  uiState: IndexUiState;
  salary: { salaryMin: number | null; excludeNoSalary: boolean };
} {
  const refinementList = buildJobTagRefinements({
    tags: alert.tags,
    locations: alert.locations,
  });

  const toggle: NonNullable<IndexUiState["toggle"]> = {};
  if (alert.is_orgs_highlighted) {
    toggle.is_orgs_highlighted = true;
  }
  if (alert.is_exclude_career_capital) {
    toggle.is_not_career_capital = true;
  }
  if (alert.is_exclude_profit_for_good) {
    toggle.is_not_profit_for_good = true;
  }

  const uiState: IndexUiState = {};
  if (Object.keys(refinementList).length > 0) {
    uiState.refinementList = refinementList;
  }
  if (Object.keys(toggle).length > 0) {
    uiState.toggle = toggle;
  }

  return {
    uiState,
    salary: {
      salaryMin: alert.salary_min ?? null,
      excludeNoSalary: alert.is_exclude_no_salary ?? false,
    },
  };
}
