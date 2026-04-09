import { Box, Grid, HStack, Stack } from "@chakra-ui/react";
import { useRef, type ReactNode } from "react";
import { InstantSearch } from "react-instantsearch";
import type { ID } from "@/gql-tada";
import type { FacetsActiveConfig } from "@/sites/pg/components/PgAlgoliaFacetsActive";
import {
  PgFilterCardWithSplitBg,
  PgFacetsActive,
  PgMobileCollapsible,
} from "@/sites/pg/components/PgAlgoliaFilterCard";
import {
  PgInfiniteHits,
  type PgInfiniteHitsProps,
} from "@/sites/pg/components/PgAlgoliaInfiniteHits";
import { PgAlgoliaListSkeleton } from "@/sites/pg/components/PgAlgoliaListSkeleton";
import { PgAlgoliaSearchStats } from "@/sites/pg/components/PgAlgoliaSearchStats";
import { PgAlgoliaSortSelect } from "@/sites/pg/components/PgAlgoliaSortSelect";
import { PgSearchInput } from "@/sites/pg/components/PgSearchInput";
import { type AlgoliaIndexKey, useAlgoliaSearchClient } from "@/utils/useAlgoliaSearchClient";

export function PgAlgoliaList<TItem extends { id: ID }, TData = unknown>(props: {
  index: AlgoliaIndexKey;
  label: string;
  searchInputTestId?: string;
  hits: Omit<PgInfiniteHitsProps<TItem, TData>, "label">;
  sort?: { items: Array<{ value: string; label: string }> };
  subheader?: ReactNode;
  facetsTopbar: ReactNode;
  facetsActive: FacetsActiveConfig;
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
          // for infinite scroll: drop pagination from URL
          stateToRoute: uiState => {
            // (LLM said "configure" is redundant, and iirc i 'confirmed' it by docs)
            const params = { pagination: "page", configRedundant: "configure" };
            const paramsExcluded = [params.pagination, params.configRedundant];
            return {
              [indexName]: Object.fromEntries(
                Object.entries(uiState[indexName] ?? {}).filter(
                  stateAttrName => !paramsExcluded.includes(stateAttrName[0]),
                ),
              ),
            };
          },
          routeToState: routeState => routeState,
        },
      }}
      future={{ preserveSharedStateOnUnmount: true }}
      insights={true}
    >
      {props.children}

      <Stack gap="gap.sm" w="full">
        <PgFilterCardWithSplitBg isOpenRef={pgFilterCardIsOpenRef}>
          {/* Mobile */}
          <Box
            hideFrom="md"
            borderWidth="1px"
            borderColor="fg"
            borderRadius="lg"
            p="gap.sm"
            bg="bg"
          >
            <Stack gap="gap.sm">
              <PgSearchInput
                testId={props.searchInputTestId}
                endElementText={
                  <PgAlgoliaSearchStats label={labelPlural} indexName={indexName} />
                }
              />
              <PgMobileCollapsible
                cta={props.ctaMobile ?? props.cta}
                facetsTopbar={props.facetsTopbar}
                facetsActive={props.facetsActive}
                onOpenChange={open => {
                  pgFilterCardIsOpenRef.current = open;
                }}
              />
            </Stack>
          </Box>

          {/* Desktop */}
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
                <PgSearchInput
                  testId={props.searchInputTestId}
                  endElementText={
                    <PgAlgoliaSearchStats label={labelPlural} indexName={indexName} />
                  }
                />
              </Box>

              <Box>{props.cta}</Box>

              <PgFacetsActive facetsActive={props.facetsActive} />

              <Box gridColumn="span 5">{props.facetsTopbar}</Box>
            </Grid>
          </Box>
        </PgFilterCardWithSplitBg>

        {(props.sort || props.subheader) && (
          <HStack
            justify="space-between"
            position="relative"
            pt={{ base: "3", md: "2px" }}
            pb="0"
            px={{ base: "0", md: "26px" }}
          >
            {props.sort && <PgAlgoliaSortSelect items={props.sort.items} />}

            {props.subheader}
          </HStack>
        )}

        <PgInfiniteHits {...props.hits} />
      </Stack>
    </InstantSearch>
  );
}
