/**
 * #quality-9%
 * - Didn't always show Skeletons or triggers `loadMore` - while we tried to fix this 5+ times.
 * - Takes 0.3s to render on the main thread - hard to see why.
 * - Definitely #AI-slop React - destructs, `item` naming, etc.
 *    - Instead it waits for you to scroll up+down to re-trigger it.
 * - "React Compiler" can't put useMemo on it.
 * - Don't know why it calls useRef instead of Valtio, probably #AI-slop.
 *
 * This is a duplicate of [[AlgoliaList.tsx]] - ie uses its complex TS Generics wo/ any of the original reuse benefits.
 *
 * todo ! refac: drop -> use AlgoliaList. See [[ReviewListAlgolia.tsx]].
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

  const isSearchLoading = search.status !== "idle";
  // #AI: IntersectionObserver fires only when visibility changes - `showMore` inside it
  // stalled while the sentinel stayed in view. This re-runs on `isSearchLoading`, ie once
  // per loaded page.
  useEffect(() => {
    if (state.snap.isSentinelVisible && !hits.isLastPage && !isSearchLoading) {
      hits.showMore();
    }
  }, [state.snap.isSentinelVisible, hits.isLastPage, isSearchLoading]);

  const jsx = getJsxVars();

  function getJsxVars() {
    const isSearchActive =
      searchBox.query.length > 0 ||
      currentRefinements.items.length > 0 ||
      Boolean(props.isExtraFilterActive);

    let jobsFiltered = hits.items;
    if (props.hitOpenedPinned?.id && !isSearchActive) {
      jobsFiltered = hits.items.filter(job => job.id !== props.hitOpenedPinned?.id);
    }

    // Prob wrong. Beware: it was "fixed" 5+ times. Must be simpler, i think.
    const isNoJobs = jobsFiltered.length === 0;
    const isLoadInitial = !hits.results;
    const isEmptyBeforeSearch = !isSearchActive && isNoJobs;
    const isShowSkeleton = isLoadInitial || isEmptyBeforeSearch || (isNoJobs && isSearchLoading);

    const isJobOpen = props.hitOpenedPinned?.node && !isSearchActive;
    const isNoResults = isNoJobs && !isJobOpen;

    return {
      isSearchActive,
      jobsFiltered,
      isShowSkeleton,
      isNoResults,
      isLoadingMore: !isShowSkeleton && !hits.isLastPage && isSearchLoading,
    };
  }

  return (
    <Stack gap="gap.xl" w="full">
      {props.hitOpenedPinned?.node && !jsx.isSearchActive && props.hitOpenedPinned.node}

      <Stack data-testid={props.listTestId} gap="gap.md">
        {jsx.isShowSkeleton ? (
          <PgJobCardSkeletons count={skeletonCountInitial} />
        ) : jsx.isNoResults ? (
          props.noResultsNode
        ) : (
          jsx.jobsFiltered.map(item =>
            props.renderHit(item, { isSearchActive: jsx.isSearchActive }),
          )
        )}
        {jsx.isLoadingMore && <PgJobCardSkeletons count={hits.results!.hitsPerPage} />}
      </Stack>

      {!hits.isLastPage && (
        <Flex justify="center">
          <Button
            {...ids.set(ids.job.btn.loadMore)}
            loading={isSearchLoading}
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
