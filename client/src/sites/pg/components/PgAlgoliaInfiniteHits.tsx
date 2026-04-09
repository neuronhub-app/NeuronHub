/**
 * #quality-9%
 * - Doesn't always show Skeletons or triggers `loadMore` - while we tried to fix this 3+ times.
 *    - Instead it waits for you to scroll up+down to re-trigger it.
 * - Takes 0.3s to render on the main thread - too hard to understand why.
 * - "React Compiler" can't put useMemo on it.
 * - Don't know why it calls useRef instead of Valtio, probably #AI-slop.
 * - Definitely #AI-slop React - destructs, `item` naming, etc.
 *
 * This is a duplicate of [[AlgoliaList.tsx]] - uses its complex API wo/ any benefit of reuse.
 * // todo ! refac: drop -> use AlgoliaList. See [[ReviewListAlgolia.tsx]].
 *
 * todo ? refac-name: JobListAlgolia
 */
import { Box, Flex, HStack, Skeleton, Stack, Text } from "@chakra-ui/react";
import type { TadaDocumentNode } from "gql.tada";
import { type ReactNode, useEffect, useRef } from "react";
import {
  useCurrentRefinements,
  useInfiniteHits,
  useInstantSearch,
  useSearchBox,
} from "react-instantsearch";
import type { ID } from "@/gql-tada";

import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";
import { useAlgoliaEnrichmentByGraphql } from "@/graphql/useAlgoliaEnrichmentByGraphql";

export type PgInfiniteHitsProps<TItem extends { id: ID }, TData = unknown> = {
  enrichment: {
    query: TadaDocumentNode<TData, { ids: ID[] }>;
    extractItems: (data: Record<string, TItem[]>) => TItem[];
  };
  renderHit: (
    item: TItem,
    ctx: { isSearchActive: boolean; isEnrichedByGraphql: boolean },
  ) => ReactNode;
  hitOpenedPinned?: { node?: ReactNode; id?: ID };
  noResultsNode: ReactNode;
  listTestId?: string;
  isExtraFilterActive?: boolean; // todo: #155 — remove with jobListFilters.ts Valtio cleanup
};

export function PgInfiniteHits<TItem extends { id: ID }, TData = unknown>(
  props: PgInfiniteHitsProps<TItem, TData>,
) {
  const searchBox = useSearchBox();
  const currentRefinements = useCurrentRefinements();
  const search = useInstantSearch();
  const hits = useInfiniteHits<TItem>();

  const showMoreCallback = useRef(hits.showMore); // why? #prob-redundant
  showMoreCallback.current = hits.showMore;

  const scrollSentinelRef = useRef<HTMLDivElement>(null);

  const state = useStateValtio({
    isLoadingMore: false,
    prevCount: 0,
  });

  const { items: jobsEnriched, isEnrichedByGraphql } = useAlgoliaEnrichmentByGraphql(
    hits.items,
    props.enrichment.query,
    props.enrichment.extractItems,
  );

  // Trigger showMore by scroll:
  useEffect(() => {
    if (!scrollSentinelRef.current) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      // why `&& !isLoadingMore`? sounds as the root of the non-triggering bug.
      // I would just trigger it - and gave 0 fucks re what it's doing when `entry.isIntersecting`.
      if (entry!.isIntersecting && !state.mutable.isLoadingMore) {
        state.mutable.isLoadingMore = true;
        showMoreCallback.current();
      }
    });
    observer.observe(scrollSentinelRef.current);
    return () => observer.disconnect();
  }, []);

  // Process showMore trigger:
  useEffect(() => {
    const isLoadedMore = hits.items.length !== state.mutable.prevCount;
    if (isLoadedMore || hits.isLastPage) {
      state.mutable.isLoadingMore = false;
      state.mutable.prevCount = hits.items.length;
    }
  }, [hits.items.length, hits.isLastPage]);

  const isSearchActive =
    searchBox.query.length > 0 ||
    currentRefinements.items.length > 0 ||
    Boolean(props.isExtraFilterActive);

  let jobsFiltered = jobsEnriched;
  if (props.hitOpenedPinned?.id && !isSearchActive) {
    jobsFiltered = jobsEnriched.filter(job => job.id !== props.hitOpenedPinned?.id);
  }

  // Wrong. Beware: was "fixed" 3+ times.
  // Must be simpler, i think.
  const isNoJobs = jobsFiltered.length === 0;
  const isLoadInitial = !hits.results;
  const isEmptyBeforeSearch = !isSearchActive && isNoJobs;
  const isShowSkeleton =
    isLoadInitial || isEmptyBeforeSearch || (isNoJobs && search.status !== "idle");

  const isJobOpen = props.hitOpenedPinned?.node && !isSearchActive;
  const isNoResults = isNoJobs && !isJobOpen;

  return (
    <Stack gap="gap.xl" w="full">
      {props.hitOpenedPinned?.node && !isSearchActive && props.hitOpenedPinned.node}

      <Stack data-testid={props.listTestId} gap="gap.md">
        {isShowSkeleton ? (
          <PgJobCardSkeletons />
        ) : isNoResults ? (
          props.noResultsNode
        ) : (
          jobsFiltered.map(item =>
            props.renderHit(item, { isSearchActive, isEnrichedByGraphql }),
          )
        )}
        {state.snap.isLoadingMore && <PgJobCardSkeletons />}
      </Stack>

      <Box ref={scrollSentinelRef} h="1" display={hits.isLastPage ? "none" : "block"} />
    </Stack>
  );
}

// #AI
export function PgJobCardSkeletons(props: { count?: number }) {
  return (
    <>
      {Array.from({ length: props.count ?? 4 }, (_, i) => (
        <Stack
          key={i}
          gap="gap.sm"
          p={{ base: "gap.md", md: "gap.xl" }}
          borderRadius="lg"
          borderWidth="1px"
          borderColor="subtle"
        >
          <Flex gap={{ base: "gap.sm", md: "gap.lg" }}>
            <Skeleton
              w={{ base: "60px", md: "90px" }}
              h={{ base: "60px", md: "90px" }}
              flexShrink="0"
              borderRadius="sm"
            />
            <Stack gap="gap.xs" flex="1">
              <Skeleton h="6" w="70%" borderRadius="sm" />
              <Skeleton h="5" w="40%" borderRadius="sm" />
              <Skeleton h="5" w="50%" borderRadius="sm" />
            </Stack>
          </Flex>
          <HStack gap="gap.sm">
            <Skeleton h="6" w="24" borderRadius="sm" />
            <Skeleton h="6" w="28" borderRadius="sm" />
            <Skeleton h="6" w="20" borderRadius="sm" />
          </HStack>
        </Stack>
      ))}
    </>
  );
}
