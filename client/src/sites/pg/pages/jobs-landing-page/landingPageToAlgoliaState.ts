/**
 * When adding a filter, see [[adding-job-alert-filters.mdx]] checklist.
 *
 * Differences vs `_get_jobs_by_alert` from [[send_job_alerts.py]]:
 * - BE ORs each tag across all `tags_*` fields (`_q_job_has_tag`); FE writes to specific Algolia attr (eg `tags_area.name`).
 * - BE has `is_exclude_*` + salary-OR-no-salary; landing pages v1 omits both.
 */
import type { IndexUiState } from "instantsearch.js";
import { useRefinementList } from "react-instantsearch";

import type { JobsLandingPage } from "@/prefetch/JobsLandingPage";
import {
  algoliaTagAttrByCategory,
  buildJobTagRefinements,
} from "@/sites/pg/pages/jobs/algoliaJobTagRefinements";

/**
 * Why: claim Algolia state for each attr [[landingPageToAlgoliaState]] need to write to.
 *
 * Otherwise <PgFacetPopover>'s `lazyMount` keeps its `useRefinementList` unmounted
 * on first render → preset refinements drop from URL routing + active chips until the user opens each popover.
 */
export function useRequiredLandingPageRefinements() {
  for (const attribute of Object.values(algoliaTagAttrByCategory)) {
    useRefinementList({ attribute });
  }
  useRefinementList({ attribute: "source_ext" });
}

// #AI, e2e tested. #quality-19%. unfuck by #187.
export function landingPageToAlgoliaState(page?: JobsLandingPage): IndexUiState | undefined {
  if (!page) {
    return undefined;
  }

  const refinementList = buildJobTagRefinements({
    tags: page.tags,
    locations: page.locations,
  });

  if (page.source_ext) {
    refinementList.source_ext = [page.source_ext];
  }

  const uiState: IndexUiState = {};
  if (Object.keys(refinementList).length > 0) {
    uiState.refinementList = refinementList;
  }
  if (page.salary_min) {
    uiState.range = { salary_min: `${page.salary_min}:` };
  }
  if (page.is_orgs_highlighted) {
    uiState.toggle = { is_orgs_highlighted: true };
  }
  return uiState;
}
