import { Flex, HStack, Stack, Text } from "@chakra-ui/react";
import type { TadaDocumentNode } from "gql.tada";
import type { ReactNode } from "react";
import {
  Configure,
  InstantSearch,
  useCurrentRefinements,
  useHits,
  useSearchBox,
} from "react-instantsearch";
import { NavLink } from "react-router";
import { useUser } from "@/apps/users/useUserCurrent";
import { Button } from "@/components/ui/button";
import type { ID } from "@/gql-tada";
import { useAlgoliaEnrichmentByGraphql } from "@/graphql/useAlgoliaEnrichmentByGraphql";
import { type AlgoliaIndexKey, useAlgoliaSearchClient } from "@/utils/useAlgoliaSearchClient";
import type { PostTypeEnum } from "~/graphql/enums";
import { AlgoliaFacets } from "./AlgoliaFacets";
import { AlgoliaPagination } from "./AlgoliaPagination";
import { AlgoliaSearchInput } from "./AlgoliaSearchInput";

// #AI
export function AlgoliaList<TItem extends { id: ID }, TData = unknown>(props: {
  index: AlgoliaIndexKey;
  label: string;
  typeFilter?: PostTypeEnum;
  createUrl?: string;
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
  children: ReactNode;
  cta?: ReactNode;
}) {
  const algolia = useAlgoliaSearchClient();
  const user = useUser();

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
      {props.typeFilter && <Configure filters={`type:${props.typeFilter}`} />}

      <Stack gap="gap.lg" w="100%">
        <HStack as="header" gap="gap.lg" flexWrap="wrap" justify="space-between">
          <Text fontSize="2xl" fontWeight="bold" textTransform="capitalize">
            {labelPlural}
          </Text>

          <Flex gap="gap.md" align="center">
            <AlgoliaSearchInput testId={props.searchInputTestId} />

            {Boolean(props.cta) && props.cta}

            {props.createUrl && user?.id && (
              <NavLink to={props.createUrl}>
                <Button
                  variant="subtle"
                  textTransform="capitalize"
                >{`Create ${props.label}`}</Button>
              </NavLink>
            )}
          </Flex>
        </HStack>

        <Flex flex="1" pos="relative" gap={{ base: "gap.lg", "2xl": "gap.xl" }}>
          <AlgoliaHits label={labelPlural} {...props.hits} />
          <AlgoliaFacets label={labelPlural}>{props.children}</AlgoliaFacets>
        </Flex>
      </Stack>
    </InstantSearch>
  );
}

// #AI
export function AlgoliaHits<TItem extends { id: ID }, TData = unknown>(props: {
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
  const hits = useHits<TItem>();
  const { items, isEnrichedByGraphql } = useAlgoliaEnrichmentByGraphql(
    hits.items,
    props.enrichment.query,
    props.enrichment.extractItems,
  );
  const isSearchActive = search.query.length > 0 || refinements.items.length > 0;

  const filteredItems =
    props.hitOpenedPinned?.id && !isSearchActive
      ? items.filter(item => item.id !== props.hitOpenedPinned!.id)
      : items;

  return (
    <Stack gap="gap.xl" w="full">
      {props.hitOpenedPinned?.node && !isSearchActive && props.hitOpenedPinned.node}

      <Stack data-testid={props.listTestId} gap="gap.md2">
        {!hits.results ? (
          <Text color="fg.subtle">Loading...</Text>
        ) : hits.results.nbHits === 0 && !props.hitOpenedPinned?.node ? (
          <HStack align="center">
            <Text>No {props.label ?? "results"} found.</Text>
          </HStack>
        ) : (
          filteredItems.map(item =>
            props.renderHit(item, { isSearchActive, isEnrichedByGraphql }),
          )
        )}
      </Stack>

      <AlgoliaPagination />
    </Stack>
  );
}
