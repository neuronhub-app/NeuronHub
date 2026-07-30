/**
 * Edit-mode facet behavior (PG only).
 *
 * Two hacks live here, both caused by one thing: [[JobAlertEditController]] reverse-applies the
 * alert's filters on mount, so a facet can first render while the alert matches 0 jobs.
 *
 * 1. Cold-cache seeding. [[PgFacetAttribute]] keeps previously-seen facet values (count 0) in a
 *    per-instance cache so narrowing to 0 results still lists selectable checkboxes. In normal
 *    browsing that cache warms while results are non-zero (the popover is opened before filters
 *    narrow to 0). But at 0 matches the cache is COLD: Algolia returns 0 disjunctive values → the
 *    popover shows only loading skeletons and no value is selectable. Fix: on entering edit mode we
 *    fetch the FULL, unfiltered facet values once ([[useSeedPgFacetsForEdit]]) and each facet primes
 *    its cache with them ([[usePgFacetSeedInto]]), mirroring the "previously-seen, now 0" semantics.
 *    Gated on edit mode (store empty otherwise) so normal browsing is unchanged.
 *
 * 2. Eager mount ([[usePgFacetEagerMount]]). In edit mode the facet widget must mount eagerly (not
 *    on first popover open): mounting registers the attribute so the reverse-applied refinement
 *    filters the list + shows chips before the popover is opened. A lazyMount popover would need a
 *    SECOND force-mounted `useRefinementList` per attribute, and two refinement-list widgets on one
 *    attribute spin react-instantsearch into an infinite re-search loop that stops the popover from
 *    opening.
 */
import type { MutableRefObject } from "react";
import { useEffect, useRef } from "react";
import type { useRefinementList } from "react-instantsearch";
import { useSnapshot } from "valtio/react";
import { proxy } from "valtio/vanilla";

import { pgTopbarTagAttr } from "@/sites/pg/components/pgTopbarTagAttr";
import { useJobAlertEditIdExt } from "@/sites/pg/pages/jobs/list/jobAlertEditState";
import { useAlgoliaSearchClient } from "@/utils/useAlgoliaSearchClient";
import { useInit } from "@/utils/useInit";

export type FacetItem = ReturnType<typeof useRefinementList>["items"][number];

type FacetSeedItem = { value: string; label: string };

const PG_TAG_FACET_ATTRIBUTES = Object.values(pgTopbarTagAttr);

const state = proxy({
  seedByAttribute: {} as Record<string, FacetSeedItem[]>,
});

export function usePgFacetEagerMount(): boolean {
  return Boolean(useJobAlertEditIdExt());
}

export function usePgFacetSeedInto(
  attribute: string,
  cacheRef: MutableRefObject<Map<string, FacetItem>>,
): void {
  const seed = usePgFacetSeed(attribute);
  const isSeedAppliedRef = useRef(false);
  if (seed && !isSeedAppliedRef.current) {
    isSeedAppliedRef.current = true;
    for (const seedItem of seed) {
      if (!cacheRef.current.has(seedItem.value)) {
        cacheRef.current.set(seedItem.value, {
          value: seedItem.value,
          label: seedItem.label,
          highlighted: seedItem.label,
          count: 0,
          isRefined: false,
        });
      }
    }
  }
}

function usePgFacetSeed(attribute: string): readonly FacetSeedItem[] | undefined {
  return useSnapshot(state).seedByAttribute[attribute];
}

export function useSeedPgFacetsForEdit(): void {
  const algolia = useAlgoliaSearchClient();

  useInit({
    isReady: Boolean(algolia.client) && Boolean(algolia.indexNameJobs),
    onInit: async () => {
      const response = await algolia.client!.search([
        {
          indexName: algolia.indexNameJobs!,
          params: {
            query: "",
            hitsPerPage: 0,
            maxValuesPerFacet: 100,
            facets: PG_TAG_FACET_ATTRIBUTES,
          },
        },
      ]);
      const facets = (response.results[0] as FacetsResult).facets ?? {};

      const seedByAttribute: Record<string, FacetSeedItem[]> = {};
      for (const attribute of PG_TAG_FACET_ATTRIBUTES) {
        seedByAttribute[attribute] = Object.keys(facets[attribute] ?? {}).map(value => ({
          value,
          label: value,
        }));
      }
      state.seedByAttribute = seedByAttribute;
    },
    dependencies: [algolia.indexNameJobs],
  });

  useEffect(() => clearPgFacetSeed, []);
}

type FacetsResult = { facets?: Record<string, Record<string, number>> };

function clearPgFacetSeed() {
  state.seedByAttribute = {};
}
