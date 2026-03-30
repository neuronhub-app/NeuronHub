import { Box, Grid, HStack, Stack } from "@chakra-ui/react";
import { useRef, type ReactNode } from "react";
import { InstantSearch } from "react-instantsearch";
import { history } from "instantsearch.js/es/lib/routers";
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
  urlParams?: {
    keys: string[];
    read: () => Record<string, string>;
    write: (params: Record<string, string>) => void;
  };
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
        router: history({
          createURL: ({ qsModule, routeState, location }) => {
            const algoliaSearch = qsModule.stringify(routeState);
            const customSearch = new URLSearchParams(props.urlParams?.read() ?? {}).toString();
            const search = [algoliaSearch, customSearch].filter(Boolean).join("&");
            return search ? `${location.pathname}?${search}` : location.pathname;
          },
          // @ts-expect-error #bad-infer qs.ParsedQs not assignable to UiState — Algolia typing gap
          parseURL: ({ qsModule, location }) => {
            const parsed = qsModule.parse(location.search, { ignoreQueryPrefix: true });
            if (props.urlParams) {
              const custom: Record<string, string> = {};
              for (const key of props.urlParams.keys) {
                const value = parsed[key];
                if (typeof value === "string") {
                  custom[key] = value;
                  delete parsed[key];
                }
              }
              props.urlParams.write(custom);
            }
            return parsed;
          },
        }),
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

        <PgInfiniteHits label={labelPlural} {...props.hits} />
      </Stack>
    </InstantSearch>
  );
}
