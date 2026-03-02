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
import { useEffect, type ReactNode } from "react";
import { LuChevronDown, LuSquareX } from "react-icons/lu";
import { InstantSearch, useClearRefinements, useSortBy, useStats } from "react-instantsearch";
import { AlgoliaHits } from "@/components/algolia/AlgoliaList";
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
    listGap?: string;
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
}) {
  const algolia = useAlgoliaSearchClient();

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
        <Stack as="header" gap="gap.sm">
          <Text fontSize="2xl" fontWeight="bold" textTransform="capitalize">
            {labelPlural}
          </Text>
        </Stack>

        <Box hideFrom="md" borderWidth="1px" borderColor="fg" borderRadius="lg" p="gap.sm">
          <Stack gap="gap.sm">
            <PgSearchInput testId={props.searchInputTestId} />
            <PgMobileCollapsible
              cta={props.cta}
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
            />
          </Stack>
        </Box>

        <Box hideBelow="md" borderWidth="1px" borderColor="fg" borderRadius="lg" p="gap.md">
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

        {(props.sort || props.subheader) && (
          <HStack gap="gap.md" justify="space-between">
            {props.sort && <PgAlgoliaSortSelect items={props.sort.items} />}
            {props.subheader}
          </HStack>
        )}

        <AlgoliaHits label={labelPlural} {...props.hits} />
      </Stack>
    </InstantSearch>
  );
}

function PgAlgoliaSortSelect(props: { items: Array<{ value: string; label: string }> }) {
  const sort = useSortBy({ items: props.items });

  return (
    <NativeSelect.Root variant="plain" size="xs" w="fit-content">
      <NativeSelect.Field
        value={sort.currentRefinement}
        onChange={event => sort.refine(event.target.value)}
        ps="1"
        w="fit-content"
      >
        {sort.options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
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
  },
) {
  const state = useStateValtio({ isOpen: false });

  return (
    <Collapsible.Root
      open={state.snap.isOpen}
      onOpenChange={details => {
        state.mutable.isOpen = details.open;
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
