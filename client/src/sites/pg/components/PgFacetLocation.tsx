import { Checkbox, Icon, Input, InputGroup, Stack, Text } from "@chakra-ui/react";
import { LuX } from "react-icons/lu";
import { useCurrentRefinements } from "react-instantsearch";
import type { ResultOf } from "gql.tada";
import { graphql } from "@/gql-tada";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";
import { PgFacetPopover } from "@/sites/pg/components/PgFacetPopover";
import { ids } from "@/e2e/ids";
import type { TestId } from "@/e2e/ids";
import type { LocationType } from "~/graphql/enums";

export const ALGOLIA_ATTR_LOCATION = "locations.algolia_filter_name";

export function PgFacetLocation(props: {
  label: string;
  type: LocationType;
  refine: (value: string) => void;
  algoliaItems: { value: string; count: number }[];
  isSearchEnabled?: boolean;
  testId?: TestId;
  order?: { base?: number; md?: number; lg?: number };
}) {
  const { data } = useApolloQuery(JobLocationsQuery);

  const currentRefs = useCurrentRefinements({
    includedAttributes: [ALGOLIA_ATTR_LOCATION],
  });
  const currentRefsValues = new Set(
    currentRefs.items.flatMap(item => item.refinements.map(ref => String(ref.value))),
  );

  const state = useStateValtio({
    query: "",
  });

  const locations = (data?.job_locations ?? []).filter(loc => loc.type === props.type);

  const locNamesAll = new Set(locations.map(loc => loc.algolia_filter_name));
  const locNamesActive: Set<string> = new Set(
    [...currentRefsValues].filter(value => locNamesAll.has(value)),
  );

  const algoliaCountByName = new Map(props.algoliaItems.map(item => [item.value, item.count]));

  function getCount(loc: JobLocation): number {
    if (currentRefsValues.size > 0) {
      return loc.job_count;
    }
    return algoliaCountByName.get(loc.algolia_filter_name) ?? 0;
  }
  type JobLocation = (typeof locations)[number];

  const query = state.snap.query.toLowerCase();
  const locationsFiltered = query
    ? locations.filter(loc => (loc.city || loc.name).toLowerCase().includes(query))
    : locations;
  const locationsVisible = locationsFiltered.toSorted((a, b) => getCount(b) - getCount(a));

  return (
    <PgFacetPopover
      label={props.label}
      attribute={ALGOLIA_ATTR_LOCATION}
      order={props.order}
      testId={props.testId}
      activeFacetCount={locNamesActive.size}
      onClear={() => {
        for (const locName of locNamesActive) {
          props.refine(locName);
        }
      }}
      onClose={() => {
        state.mutable.query = "";
      }}
    >
      <Stack align="flex-start">
        {props.isSearchEnabled && (
          <SearchInput
            query={state.snap.query}
            onQueryChange={query => {
              state.mutable.query = query;
            }}
          />
        )}

        {locationsVisible.length === 0 && (
          <Text color="fg.muted" fontSize="sm">
            No results
          </Text>
        )}

        <Stack gap="gap.sm" w="full">
          {locationsVisible.map(loc => (
            <Checkbox.Root
              key={loc.algolia_filter_name}
              checked={locNamesActive.has(loc.algolia_filter_name)}
              onCheckedChange={() => {
                props.refine(loc.algolia_filter_name);
              }}
              size="sm"
              display="grid"
              gridTemplateColumns="auto 1fr auto"
              gap="gap.sm"
              flex="1"
              className="group"
              data-testid={ids.facet.checkbox(loc.city || loc.name)}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control _groupHover={{ borderColor: "brand.green.light" }} />
              <Text
                // biome-ignore lint/security/noDangerouslySetInnerHtml: BE; query is escaped
                dangerouslySetInnerHTML={{
                  __html: highlightMatch(loc.city || loc.name, state.snap.query),
                }}
                fontSize="13px"
                color="fg"
                _groupHover={{ color: "brand.green.light" }}
              />
              <Text
                fontSize="13px"
                color="fg.muted"
                _groupHover={{ color: "brand.green.light" }}
              >
                {getCount(loc)}
              </Text>
            </Checkbox.Root>
          ))}
        </Stack>
      </Stack>
    </PgFacetPopover>
  );
}

function SearchInput(props: { query: string; onQueryChange: (q: string) => void }) {
  return (
    <InputGroup
      endElement={
        props.query && (
          <Icon
            as={LuX}
            onClick={() => props.onQueryChange("")}
            boxSize="3"
            color="fg.muted"
            cursor="pointer"
          />
        )
      }
    >
      <Input
        value={props.query}
        onChange={event => props.onQueryChange(event.target.value)}
        type="search"
        placeholder="Search..."
        size="xs"
        _focus={{ borderWidth: "1px", borderColor: "brand.green" }}
      />
    </InputGroup>
  );
}

export const JobLocationsQuery = graphql.persisted(
  "JobLocations",
  graphql(`
    query JobLocations {
      job_locations {
        id
        name
        type
        city
        country
        region
        is_remote
        remote_name
        algolia_filter_name
        job_count
      }
    }
  `),
);

export type JobLocationItem = NonNullable<
  ResultOf<typeof JobLocationsQuery>["job_locations"]
>[number];

function highlightMatch(text: string, query: string): string {
  if (!query) {
    return escapeHtml(text);
  }
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) {
    return escapeHtml(text);
  }
  const before = escapeHtml(text.slice(0, idx));
  const match = escapeHtml(text.slice(idx, idx + query.length));
  const after = escapeHtml(text.slice(idx + query.length));
  return `${before}<mark>${match}</mark>${after}`;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
