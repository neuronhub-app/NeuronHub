import {
  ButtonGroup,
  Checkbox,
  CloseButton,
  Flex,
  For,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Pagination,
  Stack,
  Tag,
  Text,
  useToken,
  Wrap,
} from "@chakra-ui/react";
import { useRef } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { LuSearch, LuX } from "react-icons/lu";
import {
  Configure,
  InstantSearch,
  useClearRefinements,
  useCurrentRefinements,
  useHits,
  usePagination,
  useRefinementList,
  useSearchBox,
  useStats,
  useToggleRefinement,
} from "react-instantsearch";
import { JobCard } from "@/apps/jobs/list/JobCard/JobCard";
import { useAlgoliaJobsEnrichmentByGraphql } from "@/apps/jobs/list/useAlgoliaJobsEnrichmentByGraphql";
import { Button } from "@/components/ui/button";
import { ids } from "@/e2e/ids";
import type { JobFragmentType } from "@/graphql/fragments/jobs";
import { gap } from "@/theme/theme";
import { useAlgoliaSearchClient } from "@/utils/useAlgoliaSearchClient";

export function JobList() {
  const algolia = useAlgoliaSearchClient();

  if (algolia.loading) {
    return <p>Loading Algolia...</p>;
  }
  if (!algolia.client || !algolia.indexNameJobs) {
    return <p>Search not available</p>;
  }

  return (
    <InstantSearch
      searchClient={algolia.client}
      indexName={algolia.indexNameJobs}
      routing
      future={{ preserveSharedStateOnUnmount: true }}
    >
      <JobListInner />
    </InstantSearch>
  );
}

function JobListInner() {
  const search = useSearchBox();
  const isSearchActive = search.query.length > 0;

  return (
    <Stack gap="gap.lg" w="100%">
      <HStack gap="gap.lg" flexWrap="wrap" justify="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          Jobs
        </Text>
        <SearchInput />
      </HStack>

      <Configure
        hitsPerPage={20}
        facets={["*"]}
        attributesToHighlight={[
          "title",
          "org",
          "country",
          "city",
          "tags_skill.name",
          "tags_area.name",
        ]}
      />

      <Flex flex="1" pos="relative" gap="gap.xl">
        <AlgoliaHits searchQuery={search.query} />

        <Stack
          as="aside"
          aria-label="sidebar"
          pos="sticky"
          h="min"
          hideBelow="lg"
          p={{ base: gap.md, md: gap.md }}
          px={{ base: gap.md, md: gap.md }}
          minW={{ base: "", md: "2xs", lg: "300px" }}
          maxW="300px"
          gap="gap.md2"
          borderRadius="lg"
          borderColor={{ _light: "bg.muted/70", _dark: "bg.muted/70" }}
          bg="bg.panel"
        >
          <Flex mb="-2">
            <SearchStats isSearchActive={isSearchActive} />
          </Flex>
          <ActiveRefinements />
          <ToggleFacet attribute="is_remote" label="Remote" />
          <ToggleFacet attribute="is_remote_friendly" label="Remote Friendly" />
          <ToggleFacet attribute="is_visa_sponsor" label="Visa Sponsor" />
          <FacetFilter name="org" label="Organization" isSearchEnabled />
          <FacetFilter name="country" label="Country" isSearchEnabled />
          <FacetFilter name="city" label="City" isSearchEnabled />
          <FacetFilter name="tags_area.name" label="Area" isSearchEnabled />
          <FacetFilter name="tags_skill.name" label="Skills" isSearchEnabled />
          <FacetFilter name="tags_workload.name" label="Workload" />
          <FacetFilter name="tags_experience.name" label="Experience" />
          <FacetFilter name="tags_education.name" label="Education" />
        </Stack>
      </Flex>
    </Stack>
  );
}

function SearchStats(props: { isSearchActive: boolean }) {
  const stats = useStats();
  const totalRef = useRef(0);

  const total = totalRef.current;

  if (!props.isSearchActive && stats.nbHits > 0) {
    totalRef.current = stats.nbHits;
  }

  return (
    <Flex>
      {props.isSearchActive
        ? total && (
            <Text fontSize="xs" color="fg.subtle" {...ids.set(ids.job.searchStats)}>
              {stats.nbHits} / {total} jobs
            </Text>
          )
        : total && (
            <Text fontSize="xs" color="fg.subtle" {...ids.set(ids.job.searchStats)}>
              {total} jobs
            </Text>
          )}
    </Flex>
  );
}

function SearchInput() {
  const search = useSearchBox();
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <InputGroup
      startElement={<LuSearch />}
      endElement={
        search.query ? (
          <CloseButton
            size="xs"
            onClick={() => {
              search.refine("");
              inputRef.current?.focus();
            }}
            me="-2"
          />
        ) : null
      }
      w="lg"
    >
      <Input
        ref={inputRef}
        value={search.query}
        onChange={event => search.refine(event.target.value)}
        type="search"
        placeholder="Search jobs"
        {...ids.set(ids.job.searchInput)}
        bg="bg.panel"
        borderRadius="md"
        border="1px solid"
        borderColor="inherit"
        _hover={{
          borderColor: "border.emphasized",
        }}
      />
    </InputGroup>
  );
}

function AlgoliaHits(props: { searchQuery: string }) {
  const hits = useHits<JobFragmentType>();
  const pagination = usePagination();
  const { items: jobsEnriched } = useAlgoliaJobsEnrichmentByGraphql(hits.items);
  const isSearchActive = props.searchQuery.length > 0;

  return (
    <Stack gap="gap.xl" w="full">
      <Stack {...ids.set(ids.job.list)} gap="gap.xl">
        {hits.results?.nbHits && jobsEnriched.length ? (
          jobsEnriched.map(job => (
            <JobCard key={job.id} job={job} isSearchActive={isSearchActive} />
          ))
        ) : (
          <HStack align="center">
            <Text>No jobs found.</Text>
          </HStack>
        )}
      </Stack>

      {pagination.nbHits > 0 && (
        <Pagination.Root
          count={pagination.nbHits}
          pageSize={hits.results?.hitsPerPage}
          page={pagination.currentRefinement + 1}
          onPageChange={details => {
            pagination.refine(details.page - 1);
          }}
          siblingCount={2}
        >
          <ButtonGroup variant="ghost" size="sm" colorPalette="gray">
            <Pagination.PrevTrigger asChild>
              <IconButton>
                <HiChevronLeft />
              </IconButton>
            </Pagination.PrevTrigger>

            <Pagination.Items
              render={page => (
                <IconButton
                  key={page.value}
                  variant={{ base: "ghost", _selected: "outline" }}
                  bg={{ _selected: "bg.panel" }}
                  _hover={{ bg: { base: "bg.panel", _selected: "bg.emphasized" } }}
                >
                  {page.value}
                </IconButton>
              )}
            />

            <Pagination.NextTrigger asChild>
              <IconButton>
                <HiChevronRight />
              </IconButton>
            </Pagination.NextTrigger>
          </ButtonGroup>
        </Pagination.Root>
      )}
    </Stack>
  );
}

const style = {
  facets: {
    label: {
      color: "fg.muted",
      fontSize: "13px",
      fontWeight: "semibold",
    },
    value: {
      display: "inline-flex",
      gap: "gap.sm",
      color: "fg.muted",
      fontSize: "13px",
    },
  },
} as const;

function ActiveRefinements() {
  const current = useCurrentRefinements();
  const clear = useClearRefinements();

  if (!clear.canRefine) return null;

  return (
    <Stack gap="gap.sm">
      <HStack justify="space-between">
        <Text {...style.facets.label}>Active Filters</Text>
        <Button onClick={() => clear.refine()} variant="outline" size="2xs">
          Reset all
        </Button>
      </HStack>
      <Wrap gap="gap.sm">
        {current.items.flatMap(item =>
          item.refinements.map(refinement => {
            const label =
              {
                is_remote: "Remote",
                is_remote_friendly: "Remote Friendly",
                is_visa_sponsor: "Visa Sponsor",
              }[item.attribute] ?? refinement.label;
            return (
              <Tag.Root
                key={`${item.attribute}-${refinement.label}`}
                size="sm"
                variant="subtle"
                colorPalette="gray"
                cursor="pointer"
                onClick={() => item.refine(refinement)}
                _hover={{ bg: "bg.emphasized" }}
                transition="backgrounds"
                css={{ "&:hover .close-icon": { color: "red" } }}
              >
                <Tag.Label>{label}</Tag.Label>
                <Tag.EndElement>
                  <LuX className="close-icon" />
                </Tag.EndElement>
              </Tag.Root>
            );
          }),
        )}
      </Wrap>
    </Stack>
  );
}

function FacetFilter(props: { name: string; label: string; isSearchEnabled?: boolean }) {
  const refinements = useRefinementList({
    attribute: props.name,
    limit: 10,
    showMore: true,
  });

  const count = {
    color: useToken("colors", "fg.subtle")[0],
    fontSize: useToken("fontSizes", "2xs")[0],
  };

  return (
    <Stack align="flex-start">
      <Text {...style.facets.label}>{props.label}</Text>

      {props.isSearchEnabled && (
        <Input
          onChange={event => refinements.searchForItems(event.target.value)}
          type="search"
          placeholder="Search..."
          size="xs"
        />
      )}

      {refinements.items.length === 0 && (
        <Text color="fg.subtle" fontSize="sm">
          No results
        </Text>
      )}

      <Stack gap="gap.sm">
        <For each={refinements.items}>
          {item => (
            <Checkbox.Root
              key={item.value}
              checked={item.isRefined}
              onCheckedChange={() => {
                refinements.refine(item.value);
              }}
              display="flex"
              alignItems="flex-start"
              size="sm"
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label {...style.facets.value} mt="-3px">
                <Text
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: clean
                  dangerouslySetInnerHTML={{
                    __html:
                      item.highlighted! +
                      `&nbsp;<span style="margin-left: 1px; font-size: ${count.fontSize}; color: ${count.color}">${item.count}</span>`,
                  }}
                  as="span"
                />{" "}
              </Checkbox.Label>
            </Checkbox.Root>
          )}
        </For>
      </Stack>

      {refinements.canToggleShowMore && (
        <Button
          onClick={() => refinements.toggleShowMore()}
          variant="subtle-ghost-v2"
          size="2xs"
          colorPalette="gray"
        >
          {refinements.isShowingMore ? "Collapse" : "Show more"}
        </Button>
      )}
    </Stack>
  );
}

function ToggleFacet(props: { attribute: string; label: string }) {
  const toggle = useToggleRefinement({ attribute: props.attribute, on: true });
  const count = toggle.value.onFacetValue.count ?? 0;

  return (
    <Checkbox.Root
      checked={toggle.value.isRefined}
      onCheckedChange={() => toggle.refine(toggle.value)}
      display="flex"
      alignItems="center"
      size="sm"
    >
      <Checkbox.HiddenInput />
      <Checkbox.Control />
      <Checkbox.Label {...style.facets.value}>
        {props.label}
        <Text as="span" color="fg.subtle" fontSize="2xs" ml="1">
          ({count})
        </Text>
      </Checkbox.Label>
    </Checkbox.Root>
  );
}
