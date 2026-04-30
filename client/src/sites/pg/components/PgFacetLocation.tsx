import { Checkbox, Icon, Input, InputGroup, Stack, Text } from "@chakra-ui/react";
import { captureException, setExtra } from "@sentry/react";
import { setExtras } from "@sentry/react-router";
import { useCallback } from "react";
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

/**
 * todo ! fix: clicking on last count=0 checkbox freezes the FE on prod.
 * Perhaps Algolia refine() doesn't expect a valid facet name to have 0 matches.
 */
export function PgFacetLocation(props: {
  label: string;
  type: LocationType;
  refine: (value: string) => void;
  algoliaItems: Array<{ value: string; count: number }>;
  isSearchEnabled?: boolean;
  testId?: TestId;
  order?: { base?: number; md?: number; lg?: number };
}) {
  const { data } = useApolloQuery(JobLocationsQuery);

  const filtersLocActive = useCurrentRefinements({
    includedAttributes: [ALGOLIA_ATTR_LOCATION],
  });

  const state = useStateValtio({
    query: "",
  });

  const locsByType = (data?.job_locations ?? []).filter(loc => props.type === loc.type);
  const locByTypeNamesAll = new Set(locsByType.map(loc => loc.algolia_filter_name));
  const locFiltersActive = new Set(
    filtersLocActive.items.flatMap(item => item.refinements.map(ref => String(ref.value))),
  );
  const locByTypeNamesActive: Set<string> = new Set(
    [...locFiltersActive].filter(value => locByTypeNamesAll.has(value)),
  );

  const algoliaCountByName = new Map(props.algoliaItems.map(item => [item.value, item.count]));
  const getCount = useCallback(
    (loc: JobLocation) => algoliaCountByName.get(loc.algolia_filter_name) ?? 0,
    [algoliaCountByName],
  );
  type JobLocation = (typeof locsByType)[number];

  const query = state.snap.query.toLowerCase();
  const locationsFiltered = query
    ? locsByType.filter(loc => getCityOrFullName(loc).toLowerCase().includes(query))
    : locsByType;
  const locationsVisible = locationsFiltered.toSorted((a, b) => getCount(b) - getCount(a));

  return (
    <PgFacetPopover
      label={props.label}
      attribute={ALGOLIA_ATTR_LOCATION}
      order={props.order}
      testId={props.testId}
      activeFacetCount={locByTypeNamesActive.size}
      onClear={() => {
        for (const locName of locByTypeNamesActive) {
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
            <FacetCheckbox
              key={loc.algolia_filter_name}
              loc={loc}
              checked={locByTypeNamesActive.has(loc.algolia_filter_name)}
              refine={props.refine}
              searchQuery={state.snap.query}
              count={getCount(loc)}
            />
          ))}
        </Stack>
      </Stack>
    </PgFacetPopover>
  );
}

function getCityOrFullName(loc: JobLocation): string {
  return loc.city ? loc.city : loc.name;
}

function FacetCheckbox(props: {
  loc: JobLocation;
  checked: boolean;
  refine: (value: string) => void;
  searchQuery: string;
  count: number;
}) {
  const { loc } = props;
  return (
    <Checkbox.Root
      key={loc.algolia_filter_name}
      checked={props.checked}
      onCheckedChange={() => {
        props.refine(loc.algolia_filter_name);
      }}
      size="sm"
      display="grid"
      gridTemplateColumns="auto 1fr auto"
      gap="gap.sm"
      flex="1"
      className="group"
      data-testid={ids.facet.checkbox(getCityOrFullName(loc))}
    >
      <Checkbox.HiddenInput />
      <Checkbox.Control _groupHover={{ borderColor: "brand.green.light" }} />
      <Text
        // biome-ignore lint/security/noDangerouslySetInnerHtml: BE; query is escaped
        dangerouslySetInnerHTML={{
          __html: highlightMatch(getCityOrFullName(loc), props.searchQuery),
        }}
        fontSize="13px"
        color="fg"
        _groupHover={{ color: "brand.green.light" }}
      />
      <Text fontSize="13px" color="fg.muted" _groupHover={{ color: "brand.green.light" }}>
        {props.count}
      </Text>
    </Checkbox.Root>
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
      }
    }
  `),
);

export type JobLocation = NonNullable<
  ResultOf<typeof JobLocationsQuery>["job_locations"]
>[number];

// #AI
function highlightMatch(text: string, query: string): string {
  try {
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
  } catch (err) {
    setExtras({ text, query });
    captureException(err);
    return text;
  }
}

// #AI
function escapeHtml(text: string): string {
  try {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  } catch (err) {
    setExtra("escapeHTML text", text);
    captureException(err);
    return text;
  }
}
