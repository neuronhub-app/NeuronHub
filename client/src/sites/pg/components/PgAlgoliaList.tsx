import { Box, Flex, HStack, NativeSelect, Stack, Text } from "@chakra-ui/react";
import { Collapsible } from "@chakra-ui/react";
import type { TadaDocumentNode } from "gql.tada";
import type { ReactNode } from "react";
import { LuChevronDown } from "react-icons/lu";
import { InstantSearch, useSortBy, useStats } from "react-instantsearch";
import { AlgoliaFacets } from "@/components/algolia/AlgoliaFacets";
import { AlgoliaHits } from "@/components/algolia/AlgoliaList";
import { AlgoliaSearchInput } from "@/components/algolia/AlgoliaSearchInput";
import type { ID } from "@/gql-tada";
import { PgAlgoliaFacetsActive } from "@/sites/pg/components/PgAlgoliaFacetsActive";
import { type AlgoliaIndexKey, useAlgoliaSearchClient } from "@/utils/useAlgoliaSearchClient";
import { useStateValtio } from "@/utils/useStateValtio";

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
  facets: ReactNode;
  facetsTopbar: ReactNode;
  facetsActiveLabelsOverride: Record<string, string>;
  facetsActiveDateAttributes: string[];
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

      <Stack gap="gap.sm" w="100%">
        <Stack as="header" gap="gap.sm">
          <Text fontSize="2xl" fontWeight="bold" textTransform="capitalize">
            {labelPlural}
          </Text>
        </Stack>

        <Flex gap="gap.md" align="center">
          <AlgoliaSearchInput testId={props.searchInputTestId} />
          <Box hideBelow="md">{props.cta}</Box>
        </Flex>

        <Box hideFrom="md">
          <PgMobileCollapsible
            cta={props.cta}
            label={labelPlural}
            facetsTopbar={props.facetsTopbar}
            facetsActiveLabelsOverride={props.facetsActiveLabelsOverride}
            facetsActiveDateAttributes={props.facetsActiveDateAttributes}
          />
        </Box>

        <Box hideBelow="md" hideFrom="2xl">
          <Stack gap="gap.sm">
            <PgAlgoliaFacetsActive
              labelsOverride={props.facetsActiveLabelsOverride}
              dateAttributes={props.facetsActiveDateAttributes}
            />
            {props.facetsTopbar}
            <PgSearchStats label={labelPlural} />
          </Stack>
        </Box>

        {(props.sort || props.subheader) && (
          <HStack gap="gap.md" justify="space-between">
            {props.sort && <PgAlgoliaSortSelect items={props.sort.items} />}
            {props.subheader}
          </HStack>
        )}

        <Flex flex="1" pos="relative" gap={{ base: "gap.lg", "2xl": "gap.xl" }}>
          <AlgoliaHits label={labelPlural} {...props.hits} />

          <Box hideBelow="2xl">
            <AlgoliaFacets label={labelPlural}>
              <PgAlgoliaFacetsActive
                labelsOverride={props.facetsActiveLabelsOverride}
                dateAttributes={props.facetsActiveDateAttributes}
              />
              {props.facets}
            </AlgoliaFacets>
          </Box>
        </Flex>
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

function PgMobileCollapsible(props: {
  cta?: ReactNode;
  label: string;
  facetsTopbar: ReactNode;
  facetsActiveLabelsOverride: Record<string, string>;
  facetsActiveDateAttributes: string[];
}) {
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
            cursor="pointer"
            color="primary"
            fontSize="sm"
            fontWeight="medium"
            py="gap.sm"
          >
            Open Filters & Alerts
            <LuChevronDown />
          </Flex>
        </Collapsible.Trigger>
      )}
      <Collapsible.Content>
        <Stack gap="gap.md" py="gap.sm">
          {props.cta}
          <PgAlgoliaFacetsActive
            labelsOverride={props.facetsActiveLabelsOverride}
            dateAttributes={props.facetsActiveDateAttributes}
          />
          {props.facetsTopbar}
          <PgSearchStats label={props.label} />
          <Collapsible.Trigger asChild>
            <Flex
              justify="center"
              align="center"
              gap="gap.xs"
              cursor="pointer"
              color="primary"
              fontSize="sm"
              fontWeight="medium"
              pb="gap.sm"
            >
              Close Filters & Alerts
              <Box transform="rotate(180deg)">
                <LuChevronDown />
              </Box>
            </Flex>
          </Collapsible.Trigger>
        </Stack>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

function PgSearchStats(props: { label: string }) {
  const stats = useStats();

  return (
    <Text fontSize="sm">
      Showing{" "}
      <Text as="span" color="primary" fontWeight="semibold">
        {stats.nbHits}
      </Text>{" "}
      out of {stats.nbSortedHits ?? stats.nbHits} {props.label}
    </Text>
  );
}
