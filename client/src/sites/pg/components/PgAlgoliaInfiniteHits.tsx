/**
 * #quality-40%
 * PG jobs-list infinite scroll. An IntersectionObserver on a bottom sentinel (with 400px
 * rootMargin, so it pre-loads before the footer) only tracks visibility; an effect then calls
 * showMore whenever the sentinel is visible AND `search.status` is "idle" AND not last page.
 * Effect-driven (not one-shot in the observer) so the trigger is never dropped while the sentinel
 * stays continuously in view - which is what stalled loading on mobile/footer. A "Load more"
 * button is a deterministic fallback (and the e2e hook).
 *
 * This is a duplicate of [[AlgoliaList.tsx]] - uses its complex API wo/ any benefit of reuse.
 * // todo ! refac: drop -> use AlgoliaList. See [[ReviewListAlgolia.tsx]].
 *
 * todo ? refac-name: JobListAlgolia
 */
import { Box, Button, Flex, HStack, Skeleton, Stack } from "@chakra-ui/react";
import { type ReactNode, useEffect, useRef } from "react";
import {
  useCurrentRefinements,
  useInfiniteHits,
  useInstantSearch,
  useSearchBox,
} from "react-instantsearch";

import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";

import { ids } from "@/e2e/ids";
import type { ID } from "@/gql-tada";

export const skeletonCountInitial = 6;

export type PgInfiniteHitsProps<TItem extends { id: ID }> = {
  renderHit: (item: TItem, ctx: { isSearchActive: boolean }) => ReactNode;
  hitOpenedPinned?: { node?: ReactNode; id?: ID };
  noResultsNode: ReactNode;
  listTestId?: string;
  isExtraFilterActive?: boolean; // todo: #155 — remove with jobListFilters.ts Valtio cleanup
};

export function PgInfiniteHits<TItem extends { id: ID }>(props: PgInfiniteHitsProps<TItem>) {
  const searchBox = useSearchBox();
  const currentRefinements = useCurrentRefinements();
  const search = useInstantSearch();
  const hits = useInfiniteHits<TItem>();

  const scrollSentinelRef = useRef<HTMLDivElement>(null);
  const state = useStateValtio({ isSentinelVisible: false });

  useEffect(() => {
    const sentinel = scrollSentinelRef.current;
    if (!sentinel) {
      return;
    }
    const preloadNextPageMarginPx = 400;
    const observer = new IntersectionObserver(
      ([entry]) => (state.mutable.isSentinelVisible = entry!.isIntersecting),
      { rootMargin: `${preloadNextPageMarginPx}px` },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Re-checks on every dep change (not once in the observer), so a load is never dropped while
  // the sentinel stays continuously in view - eg on mobile where the footer keeps it visible.
  useEffect(() => {
    if (state.snap.isSentinelVisible && !hits.isLastPage && search.status === "idle") {
      hits.showMore();
    }
  }, [state.snap.isSentinelVisible, hits.isLastPage, search.status]);

  const isSearchActive =
    searchBox.query.length > 0 ||
    currentRefinements.items.length > 0 ||
    Boolean(props.isExtraFilterActive);

  let jobsFiltered = hits.items;
  if (props.hitOpenedPinned?.id && !isSearchActive) {
    jobsFiltered = hits.items.filter(job => job.id !== props.hitOpenedPinned?.id);
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

  const isLoadingMore = !isShowSkeleton && !hits.isLastPage && search.status !== "idle";

  return (
    <Stack gap="gap.xl" w="full">
      {props.hitOpenedPinned?.node && !isSearchActive && props.hitOpenedPinned.node}

      <Stack
        data-testid={props.listTestId}
        gap="gap.md"
        minH={isLoadInitial ? "100dvh" : undefined}
      >
        {isShowSkeleton ? (
          <PgJobCardSkeletons count={skeletonCountInitial} />
        ) : isNoResults ? (
          props.noResultsNode
        ) : (
          jobsFiltered.map(item => props.renderHit(item, { isSearchActive }))
        )}
        {isLoadingMore && <PgJobCardSkeletons count={hits.results!.hitsPerPage} />}
      </Stack>

      {!hits.isLastPage && (
        <Flex justify="center">
          <Button
            {...ids.set(ids.job.btn.loadMore)}
            loading={search.status !== "idle"}
            onClick={() => hits.showMore()}
            variant="outline"
            size="sm"
          >
            Load more
          </Button>
        </Flex>
      )}

      <Box ref={scrollSentinelRef} h="1" display={hits.isLastPage ? "none" : "block"} />
    </Stack>
  );
}

// #AI
export function PgJobCardSkeletons(props: { count: number }) {
  return (
    <>
      {Array.from({ length: props.count }, (_, i) => (
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
          </HStack>
          <Skeleton h="5" w="85%" borderRadius="sm" />
        </Stack>
      ))}
    </>
  );
}
