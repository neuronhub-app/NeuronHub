/**
 * Single source for tag-category → Algolia attr, shared by both the landing-page map
 * ([[landingPageToAlgoliaState]]) and the stored-alert map ([[alertToAlgoliaState]]).
 */
import type { IndexUiState } from "instantsearch.js";

// todo ! refac: dedup with Job.tag_category_to_field (#187)
export const algoliaTagAttrByCategory: Record<string, string> = {
  area: "tags_area.name",
  skill: "tags_skill.name",
  education: "tags_education.name",
  experience: "tags_experience.name",
  workload: "tags_workload.name",
  visa_sponsorship: "tags_country_visa_sponsor.name",
} as const;

type RefinementList = NonNullable<IndexUiState["refinementList"]>;

/**
 * Callers layer their own extras (source, salary, toggles) on top of the returned `refinementList`.
 */
export function buildJobTagRefinements(args: {
  tags: ReadonlyArray<{ name: string; category_name?: string | null }>;
  locations: ReadonlyArray<{ algolia_filter_name: string }>;
}): RefinementList {
  const refinementList: RefinementList = {};

  for (const tag of args.tags) {
    const attr = tag.category_name && algoliaTagAttrByCategory[tag.category_name];
    // Unmapped categories (eg country/city) — served via the locations facet.
    if (!attr) {
      continue;
    }
    refinementList[attr] = [...(refinementList[attr] ?? []), tag.name];
  }

  if (args.locations.length > 0) {
    refinementList["locations.algolia_filter_name"] = args.locations.map(
      loc => loc.algolia_filter_name,
    );
  }

  return refinementList;
}
