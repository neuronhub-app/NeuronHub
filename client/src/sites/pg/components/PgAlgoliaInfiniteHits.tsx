import { Box, Flex, HStack, Skeleton, Stack, Text } from "@chakra-ui/react";
import type { TadaDocumentNode } from "gql.tada";
import { useEffect, useRef, type ReactNode } from "react";
import { useCurrentRefinements, useInfiniteHits, useSearchBox } from "react-instantsearch";
import { useAlgoliaEnrichmentByGraphql } from "@/graphql/useAlgoliaEnrichmentByGraphql";
import type { ID } from "@/gql-tada";

export function PgInfiniteHits<TItem extends { id: ID }, TData = unknown>(props: {
  enrichment: {
    query: TadaDocumentNode<TData, { ids: ID[] }>;
    extractItems: (data: Record<string, TItem[]>) => TItem[];
  };
  renderHit: (
    item: TItem,
    ctx: { isSearchActive: boolean; isEnrichedByGraphql: boolean },
  ) => ReactNode;
  hitOpenedPinned?: { node?: ReactNode; id?: ID };
  label?: string;
  listTestId?: string;
}) {
  const search = useSearchBox();
  const refinements = useCurrentRefinements();
  const hits = useInfiniteHits<TItem>();
  const showMoreCallback = useRef(hits.showMore);
  showMoreCallback.current = hits.showMore;
  const scrollSentinelRef = useRef<HTMLDivElement>(null);
  const { items, isEnrichedByGraphql } = useAlgoliaEnrichmentByGraphql(
    hits.items,
    props.enrichment.query,
    props.enrichment.extractItems,
  );
  const isSearchActive = search.query.length > 0 || refinements.items.length > 0;

  useEffect(() => {
    const sentinelElement = scrollSentinelRef.current;
    if (!sentinelElement) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry!.isIntersecting) {
        showMoreCallback.current();
      }
    });
    observer.observe(sentinelElement);
    return () => observer.disconnect();
  }, []);

  const filteredItems =
    props.hitOpenedPinned?.id && !isSearchActive
      ? items.filter(item => item.id !== props.hitOpenedPinned!.id)
      : items;

  const hasNoResults = filteredItems.length === 0 && !props.hitOpenedPinned?.node;

  return (
    <Stack gap="gap.xl" w="full">
      {props.hitOpenedPinned?.node && !isSearchActive && props.hitOpenedPinned.node}

      <Stack data-testid={props.listTestId} gap="gap.md">
        {!hits.results ? (
          <PgHitSkeletons />
        ) : hasNoResults ? (
          <Text>No {props.label ?? "results"} found.</Text>
        ) : (
          filteredItems.map(item =>
            props.renderHit(item, { isSearchActive, isEnrichedByGraphql }),
          )
        )}
      </Stack>

      <Box ref={scrollSentinelRef} h="1" display={hits.isLastPage ? "none" : "block"} />
    </Stack>
  );
}

// #AI
export function PgHitSkeletons() {
  return (
    <>
      {Array.from({ length: 4 }, (_, i) => (
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
