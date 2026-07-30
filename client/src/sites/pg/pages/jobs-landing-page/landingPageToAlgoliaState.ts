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

// todo ! refac: dedup with Job.tag_category_to_field (#187)
const algoliaTagAttrByCategory: Record<string, string> = {
  area: "tags_area.name",
  skill: "tags_skill.name",
  education: "tags_education.name",
  experience: "tags_experience.name",
  workload: "tags_workload.name",
  visa_sponsorship: "tags_country_visa_sponsor.name",
} as const;

export const algoliaAttrOrgType = "org.org_type";

/**
 * Why: claim Algolia state for each attr [[landingPageToAlgoliaState]] need to write to.
 *
 * Otherwise <PgFacetPopover>'s `lazyMount` keeps its `useRefinementList` unmounted
 * on first render → preset refinements drop from URL routing + active chips until the user opens each popover.
 * `source_ext` and `org.org_type` have no facet UI at all, so nothing would ever mount them.
 */
export function useRequiredLandingPageRefinements() {
  for (const attribute of Object.values(algoliaTagAttrByCategory)) {
    useRefinementList({ attribute });
  }
  useRefinementList({ attribute: "source_ext" });
  useRefinementList({ attribute: algoliaAttrOrgType });
}

// #AI, e2e tested. #quality-19%. unfuck by #187.
export function landingPageToAlgoliaState(page?: JobsLandingPage): IndexUiState | undefined {
  if (!page) {
    return undefined;
  }

  const refinementList: NonNullable<IndexUiState["refinementList"]> = {};

  for (const tag of page.tags) {
    const attr = tag.category_name && algoliaTagAttrByCategory[tag.category_name];
    // Unmapped categories (eg country/city) — admin uses the locations facet.
    if (!attr) {
      continue;
    }
    refinementList[attr] = [...(refinementList[attr] ?? []), tag.name];
  }

  if (page.locations.length > 0) {
    refinementList["locations.algolia_filter_name"] = page.locations.map(
      loc => loc.algolia_filter_name,
    );
  }

  if (page.source_ext) {
    refinementList.source_ext = [page.source_ext];
  }

  if (page.org_type) {
    refinementList[algoliaAttrOrgType] = [page.org_type];
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
  // Undefined, not `{}` - consumers gate on truthiness; admin pages can have zero filters.
  return Object.keys(uiState).length > 0 ? uiState : undefined;
}
