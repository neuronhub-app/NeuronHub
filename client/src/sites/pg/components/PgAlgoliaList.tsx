import { Box, Grid, HStack, Stack } from "@chakra-ui/react";
import type { IndexUiState, UiState } from "instantsearch.js";
import { useRef, type ReactNode } from "react";
import { InstantSearch } from "react-instantsearch";

import type { ID } from "@/gql-tada";
import type { JobsLandingPage } from "@/prefetch/JobsLandingPage";
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
import { landingPageToAlgoliaState } from "@/sites/pg/pages/jobs-landing-page/landingPageToAlgoliaState";
import { type AlgoliaIndexKey, useAlgoliaSearchClient } from "@/utils/useAlgoliaSearchClient";

export function PgAlgoliaList<TItem extends { id: ID }>(props: {
  index: AlgoliaIndexKey;
  label: string;
  searchInputTestId?: string;
  hits: Omit<PgInfiniteHitsProps<TItem>, "label">;
  sort?: { items: Array<{ value: string; label: string }> };
  subheader?: ReactNode;
  facetsTopbar: ReactNode;
  facetsActive: FacetsActiveConfig;
  children?: ReactNode;
  cta?: ReactNode;
  ctaMobile?: ReactNode;
  jobsLandingPage?: JobsLandingPage;
}) {
  const algolia = useAlgoliaSearchClient();

  const indexName = algolia[props.index];

  if (algolia.loading || !algolia.client || !indexName) {
    return <PgAlgoliaListSkeleton />;
  }

  const uiStateForLandingPage: IndexUiState | undefined = landingPageToAlgoliaState(
    props.jobsLandingPage,
  );

  // #AI: Landing-page: clean URL if state == preset => URL params on user edits.
  // `routeToState({}) → preset` survives empty URL on initial load + reloads.
  const routing = {
    stateMapping: {
      stateToRoute: (uiState: UiState) => {
        const urlParamsExcludedForInfiniteScroll = [
          "page",
          "configure", // i confirmed by Algolia docs eye-scan that its is redundant.
        ];
        const stateFiltered = Object.fromEntries(
          Object.entries(uiState[indexName] ?? {}).filter(
            entry => !urlParamsExcludedForInfiniteScroll.includes(entry[0]),
          ),
        );

        if (
          uiStateForLandingPage &&
          JSON.stringify(uiStateForLandingPage) === JSON.stringify(stateFiltered)
        ) {
          return {};
        }
        return { [indexName]: stateFiltered };
      },
      routeToState: (routeState: UiState) => {
        const isStateEmpty = !routeState[indexName];
        if (uiStateForLandingPage && isStateEmpty) {
          return { [indexName]: uiStateForLandingPage };
        }
        return routeState;
      },
    },
  };

  const labelPlural = `${props.label}s`;

  return (
    <InstantSearch
      searchClient={algolia.client}
      indexName={indexName}
      initialUiState={uiStateForLandingPage ? { [indexName]: uiStateForLandingPage } : undefined}
      routing={routing}
      future={{ preserveSharedStateOnUnmount: true }}
      insights={true}
    >
      {props.children}

      <Stack gap="gap.sm" w="full">
        <PgFilterCardWithSplitBg>
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

              <Box gridColumn="span 5">{props.facetsTopbar}</Box>

              <PgFacetsActive facetsActive={props.facetsActive} />
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
