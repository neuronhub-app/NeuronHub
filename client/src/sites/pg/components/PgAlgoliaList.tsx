import {
  Box,
  Collapsible,
  Flex,
  Grid,
  HStack,
  Icon,
  NativeSelect,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { TadaDocumentNode } from "gql.tada";
import React, { useEffect, useRef, type ReactNode, type RefObject } from "react";
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

  if (algolia.loading) {
    return <p>Loading Algolia...</p>;
  }
  const indexName = algolia[props.index];
  if (!algolia.client || !indexName) {
    return <p>Search not available</p>;
  }

  const labelPlural = `${props.label}s`;

  return (
    <InstantSearch
      searchClient={algolia.client}
      indexName={indexName}
      routing
      future={{ preserveSharedStateOnUnmount: true }}
    >
      {props.children}

      <Stack gap="gap.sm" w="full">
        <PgFilterCardWithSplitBg isOpenRef={pgFilterCardIsOpenRef}>
          <Box
            hideFrom="md"
            borderWidth="1px"
            borderColor="fg"
            borderRadius="lg"
            p="gap.sm"
            bg="bg"
          >
            <Stack gap="gap.sm">
              <PgSearchInput testId={props.searchInputTestId} />
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

          <Box
            hideBelow="md"
            borderWidth="1px"
            borderColor="fg"
            borderRadius="lg"
            p="gap.md"
            bg="bg"
          >
            <Grid templateColumns="repeat(5, 1fr)" gap="gap.md">
              <Box gridColumn="span 4">
                <PgSearchInput testId={props.searchInputTestId} />
              </Box>
              <Box>{props.cta}</Box>

              <Box gridColumn="span 5">{props.facetsTopbar}</Box>

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

              <Box gridColumn="span 5">
                <HStack justify="space-between">
                  <PgSearchStats label={labelPlural} indexName={indexName} />
                  <ClearAllFiltersButton onClear={props.onClearAdditional} />
                </HStack>
              </Box>
            </Grid>
          </Box>
        </PgFilterCardWithSplitBg>

        {(props.sort || props.subheader) && (
          <HStack
            justify="space-between"
            position="relative"
            pt={{ base: "3", md: "gap.xl" }}
            pb="0"
            px={{ base: "0", md: "26px" }}
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
          <Text color="fg.subtle">Loading...</Text>
        ) : hasNoResults ? (
          <Text>No {props.label ?? "results"} found.</Text>
        ) : (
          filteredItems.map(item =>
            props.renderHit(item, { isSearchActive, isEnrichedByGraphql }),
          )
        )}
      </Stack>

      {!hits.isLastPage && <Box ref={sentinelRef} h="1" />}
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

  return (
    <NativeSelect.Root variant="plain" size="xs" w="fit-content">
      <NativeSelect.Field
        value={sort.currentRefinement}
        onChange={event => sort.refine(event.target.value)}
        ps="0"
        w="fit-content"
        fontWeight="500"
        fontSize="sm"
        color="brand.black"
        _focusVisible={{ outline: "none", boxShadow: "none" }}
      >
        {sort.options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </NativeSelect.Field>
      <NativeSelect.Indicator ms="gap.sm" color="brand.black" />
    </NativeSelect.Root>
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
          <ClearAllFiltersButtonConditional
            onClear={props.onClearAdditional}
            extraTags={props.extraTags}
          />
          <Box pt="1">{props.facetsTopbar}</Box>
          <Stack gap="gap.xs">
            <PgSearchStats label={props.label} indexName={props.indexName} textAlign="center" />
            <HStack justify="space-between">
              <ClearAllFiltersButton onClear={props.onClearAdditional} />
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

function PgSearchStats(props: { label: string; indexName: string; textAlign?: "center" }) {
  const stats = useStats();
  const algolia = useAlgoliaSearchClient();
  const state = useStateValtio({ total: null as number | null });

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

  return (
    <Text fontSize="sm" fontWeight="medium" textAlign={props.textAlign}>
      Showing{" "}
      <Text as="span" color="primary" fontWeight="medium">
        {stats.nbHits}
      </Text>
      {state.snap.total !== null && ` out of ${state.snap.total}`} {props.label}
    </Text>
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
    >
      <Icon boxSize="3.5">
        <LuSquareX />
      </Icon>
      Clear all filters
    </Flex>
  );
}
