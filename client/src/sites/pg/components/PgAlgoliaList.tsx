import {
  Box,
  Collapsible,
  createListCollection,
  Flex,
  FormatNumber,
  Grid,
  HStack,
  Icon,
  Select,
  Skeleton,
  SkeletonText,
  Stack,
  SystemStyleObject,
  Text,
} from "@chakra-ui/react";
import type { TadaDocumentNode } from "gql.tada";
import React, { useEffect, useRef, type ReactNode, type RefObject, ComponentProps } from "react";
import { LuChevronDown, LuSquareX } from "react-icons/lu";
import {
  InstantSearch,
  useClearRefinements,
  useCurrentRefinements,
  useInfiniteHits,
  useSearchBox,
  useSortBy,
  useStats,
} from "react-instantsearch";
import { useAlgoliaEnrichmentByGraphql } from "@/graphql/useAlgoliaEnrichmentByGraphql";
import { PgSearchInput } from "@/sites/pg/components/PgSearchInput";
import type { ID } from "@/gql-tada";
import {
  PgAlgoliaFacetsActive,
  type RefinementActive,
} from "@/sites/pg/components/PgAlgoliaFacetsActive";
import { type AlgoliaIndexKey, useAlgoliaSearchClient } from "@/utils/useAlgoliaSearchClient";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";

export function PgAlgoliaList<TItem extends { id: ID }, TData = unknown>(props: {
  index: AlgoliaIndexKey;
  label: string;
  searchInputTestId?: string;
  hits: {
    enrichment: {
      query: TadaDocumentNode<TData, { ids: ID[] }>;
      extractItems: (data: Record<string, TItem[]>) => TItem[];
    };
    renderHit: (
      item: TItem,
      ctx: { isSearchActive: boolean; isEnrichedByGraphql: boolean },
    ) => ReactNode;
    hitOpenedPinned?: { node?: ReactNode; id?: ID };
    listTestId?: string;
  };
  sort?: { items: Array<{ value: string; label: string }> };
  subheader?: ReactNode;
  facetsTopbar: ReactNode;
  facetsActiveLabelsOverride: Record<string, string>;
  facetsActiveDateAttributes: string[];
  facetsActiveMoneyAttributes?: string[];
  facetsActiveFormatAttribute?: Record<string, (refinement: RefinementActive) => string>;
  facetsActiveSubFacetPairs?: Record<string, string>;
  facetsActiveSubFacetLabel?: Record<string, string>;
  facetsActiveExtraTags?: Array<{ label: string; onRemove: () => void }>;
  onClearAdditional?: () => void;
  children?: ReactNode;
  cta?: ReactNode;
  ctaMobile?: ReactNode;
}) {
  const algolia = useAlgoliaSearchClient();

  const pgFilterCardIsOpenRef = useRef(false);

  const indexName = algolia[props.index];

  if (algolia.loading || !algolia.client || !indexName) {
    return <PgAlgoliaListSkeleton />;
  }

  const labelPlural = `${props.label}s`;

  return (
    <InstantSearch
      searchClient={algolia.client}
      indexName={indexName}
      routing={{
        stateMapping: {
          stateToRoute: uiState => {
            const indexState = uiState[indexName] ?? {};
            const urlState = Object.fromEntries(
              Object.entries(indexState).filter(
                entry => entry[0] !== "page" && entry[0] !== "configure",
              ),
            );
            return { [indexName]: urlState };
          },
          routeToState: routeState => routeState,
        },
      }}
      future={{ preserveSharedStateOnUnmount: true }}
    >
      {props.children}

      <Stack gap="gap.sm" w="full">
        <PgFilterCardWithSplitBg isOpenRef={pgFilterCardIsOpenRef}>
          {/* Mobile */}
          <Box
            hideFrom={style.breakpoint}
            borderWidth="1px"
            borderColor="fg"
            borderRadius="lg"
            p="gap.sm"
            bg="bg"
          >
            <Stack gap="gap.sm">
              <PgSearchInput
                testId={props.searchInputTestId}
                endElementText={<PgSearchStats label={labelPlural} indexName={indexName} />}
                isHideResetBtn={true}
              />
              <PgMobileCollapsible
                cta={props.ctaMobile ?? props.cta}
                label={labelPlural}
                indexName={indexName}
                facetsTopbar={props.facetsTopbar}
                labelsOverride={props.facetsActiveLabelsOverride}
                dateAttributes={props.facetsActiveDateAttributes}
                moneyAttributes={props.facetsActiveMoneyAttributes}
                formatAttribute={props.facetsActiveFormatAttribute}
                subFacetPairs={props.facetsActiveSubFacetPairs}
                subFacetLabel={props.facetsActiveSubFacetLabel}
                extraTags={props.facetsActiveExtraTags}
                onClearAdditional={props.onClearAdditional}
                onOpenChange={open => {
                  pgFilterCardIsOpenRef.current = open;
                }}
              />
            </Stack>
          </Box>

          {/* Desktop */}
          <Box
            hideBelow={style.breakpoint}
            borderWidth="1px"
            borderColor="fg"
            borderRadius="lg"
            p="gap.md"
            bg="bg"
          >
            <Grid templateColumns="repeat(5, 1fr)" gap="gap.md">
              <Box gridColumn="span 4">
                <PgSearchInput
                  testId={props.searchInputTestId}
                  endElementText={<PgSearchStats label={labelPlural} indexName={indexName} />}
                />
              </Box>

              <Box>{props.cta}</Box>

              {/* @ts-expect-error #bad-infer not worth it. */}
              <PgFacetsActive {...props} />

              <Box gridColumn="span 5">{props.facetsTopbar}</Box>
            </Grid>
          </Box>
        </PgFilterCardWithSplitBg>

        {(props.sort || props.subheader) && (
          <HStack
            justify="space-between"
            position="relative"
            pt={{ base: "3", [style.breakpoint]: "gap.xl" }}
            pb="0"
            px={{ base: "0", [style.breakpoint]: "26px" }}
          >
            {props.sort && <PgAlgoliaSortSelect items={props.sort.items} />}

            {props.subheader}
          </HStack>
        )}

        <PgInfiniteHits label={labelPlural} {...props.hits} />
      </Stack>
    </InstantSearch>
  );
}

function PgFacetsActive(props: ComponentProps<typeof PgAlgoliaList>) {
  const clear = useClearRefinements();
  if (!clear.canRefine) {
    return null;
  }
  return (
    <Collapsible.Root open={clear.canRefine} gridColumn="span 5">
      <Collapsible.Content>
        <HStack gap="gap.md">
          <ClearAllFiltersButtonConditional onClear={props.onClearAdditional} />

          <PgAlgoliaFacetsActiveRow
            variant="desktop"
            labelsOverride={props.facetsActiveLabelsOverride}
            dateAttributes={props.facetsActiveDateAttributes}
            moneyAttributes={props.facetsActiveMoneyAttributes}
            formatAttribute={props.facetsActiveFormatAttribute}
            subFacetPairs={props.facetsActiveSubFacetPairs}
            subFacetLabel={props.facetsActiveSubFacetLabel}
            extraTags={props.facetsActiveExtraTags}
          />
        </HStack>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function PgInfiniteHits<TItem extends { id: ID }, TData = unknown>(props: {
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
  const showMoreRef = useRef(hits.showMore);
  showMoreRef.current = hits.showMore;
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { items, isEnrichedByGraphql } = useAlgoliaEnrichmentByGraphql(
    hits.items,
    props.enrichment.query,
    props.enrichment.extractItems,
  );
  const isSearchActive = search.query.length > 0 || refinements.items.length > 0;

  useEffect(() => {
    const sentinelEl = sentinelRef.current;
    if (!sentinelEl) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry!.isIntersecting) showMoreRef.current();
    });
    observer.observe(sentinelEl);
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

      <Box ref={sentinelRef} h="1" display={hits.isLastPage ? "none" : "block"} />
    </Stack>
  );
}

function PgFilterCardWithSplitBg(props: { children: ReactNode; isOpenRef: RefObject<boolean> }) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cardEl = cardRef.current;
    if (!cardEl) {
      return;
    }
    const observer = new ResizeObserver(() => {
      if (!props.isOpenRef.current) {
        cardEl.style.setProperty("--split-bg-h", `${cardEl.offsetHeight / 2}px`);
      }
    });
    observer.observe(cardEl);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      position="relative"
      ref={cardRef}
      style={{ "--split-bg-h": "50%" } as React.CSSProperties}
    >
      <Box
        position="absolute"
        top="0"
        left="-9999px"
        right="-9999px"
        h="var(--split-bg-h)"
        bg="brand.green"
      />
      <Box
        position="absolute"
        top="var(--split-bg-h)"
        left="-9999px"
        right="-9999px"
        bottom="-9999px"
        bg="bg"
      />
      <Box position="relative">{props.children}</Box>
    </Box>
  );
}

function PgAlgoliaSortSelect(props: { items: Array<{ value: string; label: string }> }) {
  const sort = useSortBy({ items: props.items });
  const collection = createListCollection({ items: props.items });

  return (
    <Select.Root
      collection={collection}
      value={[sort.currentRefinement]}
      onValueChange={details => sort.refine(details.value[0]!)}
      variant="ghost"
      size="xs"
      w="fit-content"
    >
      <Select.HiddenSelect />
      <Select.Control>
        <Select.Trigger
          ps="0"
          fontWeight="500"
          fontSize="sm"
          color="brand.black"
          cursor="pointer"
          _focusVisible={{ outline: "none", boxShadow: "none" }}
        >
          <Select.ValueText />
          <Select.Indicator ms="gap.sm" color="brand.black" />
        </Select.Trigger>
      </Select.Control>
      <Select.Positioner>
        <Select.Content
          bg="bg"
          borderColor="fg"
          borderWidth="1px"
          borderRadius="sm"
          p="3"
          w="fit-content"
          minW="unset"
        >
          {collection.items.map(item => (
            <Select.Item
              key={item.value}
              item={item}
              fontSize="sm"
              color="fg"
              cursor="pointer"
              bg="transparent"
              _highlighted={{ bg: "transparent", color: "brand.green.light" }}
            >
              {item.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  );
}

type FacetsActiveProps = {
  labelsOverride: Record<string, string>;
  dateAttributes: string[];
  moneyAttributes?: string[];
  formatAttribute?: Record<string, (refinement: RefinementActive) => string>;
  subFacetPairs?: Record<string, string>;
  subFacetLabel?: Record<string, string>;
  extraTags?: Array<{ label: string; onRemove: () => void }>;
};

function PgMobileCollapsible(
  props: FacetsActiveProps & {
    cta?: ReactNode;
    label: string;
    indexName: string;
    facetsTopbar: ReactNode;
    onClearAdditional?: () => void;
    onOpenChange?: (open: boolean) => void;
  },
) {
  const state = useStateValtio({ isOpen: false });

  return (
    <Collapsible.Root
      open={state.snap.isOpen}
      onOpenChange={details => {
        state.mutable.isOpen = details.open;
        props.onOpenChange?.(details.open);
      }}
    >
      {!state.snap.isOpen && (
        <Collapsible.Trigger asChild>
          <Flex
            justify="center"
            align="center"
            gap="gap.xs"
            color="primary"
            fontSize="sm"
            fontWeight="medium"
            h="5"
            w="full"
            cursor="pointer"
          >
            Open Filters & Alerts
            <LuChevronDown />
          </Flex>
        </Collapsible.Trigger>
      )}
      <Collapsible.Content>
        <Stack gap="gap.sm">
          {props.cta}

          <Flex gap="gap.sm">
            <ClearAllFiltersButtonConditional
              onClear={props.onClearAdditional}
              extraTags={props.extraTags}
            />
            <PgAlgoliaFacetsActiveRow
              variant="mobile"
              labelsOverride={props.labelsOverride}
              dateAttributes={props.dateAttributes}
              moneyAttributes={props.moneyAttributes}
              formatAttribute={props.formatAttribute}
              subFacetPairs={props.subFacetPairs}
              subFacetLabel={props.subFacetLabel}
              extraTags={props.extraTags}
            />
          </Flex>

          <Box pt="1">{props.facetsTopbar}</Box>

          <Stack gap="gap.xs">
            <HStack justify="space-between">
              <ClearAllFiltersButtonConditional onClear={props.onClearAdditional} />
              <Collapsible.Trigger>
                <Flex
                  align="center"
                  gap="gap.xs"
                  color="primary"
                  fontSize="sm"
                  fontWeight="medium"
                  cursor="pointer"
                >
                  Close Filters & Alerts
                  <Box transform="rotate(180deg)">
                    <LuChevronDown />
                  </Box>
                </Flex>
              </Collapsible.Trigger>
            </HStack>
          </Stack>
        </Stack>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function PgSearchStats(props: { label: string; indexName: string; fontSize?: "2xs" | "xs" }) {
  const algolia = useAlgoliaSearchClient();
  const stats = useStats();

  const state = useStateValtio({
    total: 0,
  });

  useEffect(() => {
    if (!algolia.client) {
      return;
    }
    algolia.client
      .search([{ indexName: props.indexName, params: { query: "", hitsPerPage: 0 } }])
      .then(response => {
        state.mutable.total = (response.results[0] as { nbHits: number }).nbHits;
      });
  }, [algolia.client, props.indexName]);

  // #AI
  const isFirstSearchPending = stats.nbHits === 0 && stats.processingTimeMS === 0;

  const SkeletonText4 = (
    <SkeletonText noOfLines={1} w={{ base: "30px", [style.breakpoint]: "35.5px" }} />
  );

  return (
    <Flex gap="1" align="center" fontSize="xs" color="fg.subtle" whiteSpace="nowrap">
      {isFirstSearchPending ? SkeletonText4 : <FormatNumber value={stats.nbHits} />}
      {state.snap.total ? (
        <Flex gap="1">
          <Text>/</Text>
          <FormatNumber value={state.snap.total} />
        </Flex>
      ) : (
        SkeletonText4
      )}
      <Text hideBelow={style.breakpoint}>{props.label}</Text>
    </Flex>
  );
}

function PgAlgoliaFacetsActiveRow(props: FacetsActiveProps & { variant: "desktop" | "mobile" }) {
  const refinementsClear = useClearRefinements();

  if (!refinementsClear.canRefine && !props.extraTags?.length) {
    return null;
  }

  const isDesktop = props.variant === "desktop";

  return (
    <Box gridColumn={isDesktop ? "span 5" : undefined} py={isDesktop ? undefined : "1"}>
      <PgAlgoliaFacetsActive
        labelsOverride={props.labelsOverride}
        dateAttributes={props.dateAttributes}
        moneyAttributes={props.moneyAttributes}
        formatAttribute={props.formatAttribute}
        subFacetPairs={props.subFacetPairs}
        subFacetLabel={props.subFacetLabel}
        extraTags={props.extraTags}
        tagsGap={isDesktop ? undefined : "gap.sm"}
      />
    </Box>
  );
}

function ClearAllFiltersButtonConditional(props: {
  onClear?: () => void;
  extraTags?: Array<{ label: string; onRemove: () => void }>;
}) {
  const refinementsClear = useClearRefinements();

  if (!refinementsClear.canRefine && !props.extraTags?.length) {
    return null;
  }

  return <ClearAllFiltersButton onClear={props.onClear} />;
}

function ClearAllFiltersButton(props: { onClear?: () => void }) {
  const refinementsClear = useClearRefinements();

  return (
    <Flex
      as="button"
      onClick={() => {
        refinementsClear.refine();
        props.onClear?.();
      }}
      align="center"
      gap="gap.xs"
      color="brand.green"
      fontSize="sm"
      fontWeight="medium"
      cursor="pointer"
      _hover={{ color: "brand.green.light" }}
    >
      <Icon boxSize="3.5">
        <LuSquareX />
      </Icon>
      Clear all
    </Flex>
  );
}

// #AI
function PgAlgoliaListSkeleton() {
  return (
    <Stack gap="gap.sm" w="full">
      <PgFilterCardWithSplitBg isOpenRef={{ current: false }}>
        <Box
          hideFrom={style.breakpoint}
          borderWidth="1px"
          borderColor="fg"
          borderRadius="lg"
          p="gap.sm"
          bg="bg"
        >
          <Stack gap="gap.sm">
            <Skeleton h="10" borderRadius="md" />
            <Skeleton h="5" w="40" mx="auto" borderRadius="sm" />
          </Stack>
        </Box>

        <Box
          hideBelow={style.breakpoint}
          borderWidth="1px"
          borderColor="fg"
          borderRadius="lg"
          p="gap.md"
          bg="bg"
        >
          <Grid templateColumns="repeat(5, 1fr)" gap="gap.md">
            <Box gridColumn="span 4">
              <Skeleton h="10" borderRadius="md" />
            </Box>
            <Skeleton h="10" borderRadius="md" />

            <Box gridColumn="span 5">
              <Grid
                templateColumns={{ [style.breakpoint]: "repeat(2, 1fr)", lg: "repeat(5, 1fr)" }}
                columnGap="gap.md"
                rowGap={{ [style.breakpoint]: "2" }}
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <Skeleton key={i} h="10" borderRadius="sm" />
                ))}
              </Grid>
            </Box>

            <Box gridColumn="span 5">
              <Skeleton h="5" w="48" borderRadius="sm" />
            </Box>
          </Grid>
        </Box>
      </PgFilterCardWithSplitBg>

      <HStack
        justify="space-between"
        pt={{ base: "3", [style.breakpoint]: "gap.xl" }}
        pb="0"
        px={{ base: "0", [style.breakpoint]: "26px" }}
      >
        <Skeleton h="5" w="20" borderRadius="sm" />
        <HStack gap="gap.lg">
          <Skeleton h="5" w="12" borderRadius="sm" />
          <Skeleton h="5" w="16" borderRadius="sm" />
        </HStack>
      </HStack>

      <PgHitSkeletons />
    </Stack>
  );
}

// #AI
function PgHitSkeletons() {
  return (
    <>
      {Array.from({ length: 4 }, (_, i) => (
        <Stack
          key={i}
          gap="gap.sm"
          p={{ base: "gap.md", [style.breakpoint]: "gap.xl" }}
          borderRadius="lg"
          borderWidth="1px"
          borderColor="subtle"
        >
          <Flex gap={{ base: "gap.sm", [style.breakpoint]: "gap.lg" }}>
            <Skeleton
              w={{ base: "60px", [style.breakpoint]: "90px" }}
              h={{ base: "60px", [style.breakpoint]: "90px" }}
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

const style = {
  breakpoint: "md" satisfies SystemStyleObject["hideBelow"],
} as const;
