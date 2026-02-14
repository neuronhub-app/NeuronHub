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
  SegmentGroup,
  Stack,
  Text,
  useToken,
} from "@chakra-ui/react";
import { useRef } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { LuSearch } from "react-icons/lu";
import {
  Configure,
  InstantSearch,
  useHits,
  usePagination,
  useRefinementList,
  useSearchBox,
  useSortBy,
  useToggleRefinement,
} from "react-instantsearch";
import { ProfileCard } from "@/apps/profiles/list/ProfileCard/ProfileCard";
import { useAlgoliaProfilesEnrichmentByGraphql } from "@/apps/profiles/list/useAlgoliaProfilesEnrichmentByGraphql";
import { Button } from "@/components/ui/button";
import { ids } from "@/e2e/ids";
import type { ProfileFragmentType } from "@/graphql/fragments/profiles";
import { gap } from "@/theme/theme";
import { useAlgoliaSearchClient } from "@/utils/useAlgoliaSearchClient";

export function ProfileList() {
  const algolia = useAlgoliaSearchClient();

  if (algolia.loading) {
    return <p>Loading Algolia...</p>;
  }
  if (!isAlgoliaLoaded(algolia)) {
    return <p>Search not available</p>;
  }

  return (
    <InstantSearch
      searchClient={algolia.client}
      indexName={algolia.indexNameProfiles}
      routing
      future={{ preserveSharedStateOnUnmount: true }}
    >
      <Stack gap="gap.lg">
        <HStack gap="gap.lg" flexWrap="wrap" justify="space-between">
          <Flex gap="gap.md">
            <Text fontSize="2xl" fontWeight="bold">
              Profiles
            </Text>
            <AlgoliaSortControl algolia={algolia} />
          </Flex>
          <SearchInput />
        </HStack>

        <Configure
          hitsPerPage={20}
          attributesToSnippet={["biography:60", "seeks:30", "offers:30"]}
          attributesToHighlight={[
            "biography",
            "seeks",
            "offers",
            "first_name",
            "last_name",
            "interests",
            "skills",
          ]}
        />

        <Flex flex="1" pos="relative" gap="gap.xl">
          <ProfileListHits />

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
            borderRadius="md"
            border="1px solid"
            borderColor={{ _light: "bg.muted/70", _dark: "bg.muted/70" }}
            bg={{ _light: "bg.subtle/30", _dark: "bg.subtle" }}
          >
            <Stack gap="gap.sm">
              <Text>Match Status</Text>
              <ToggleFacet attribute="is_scored_by_llm" label="LLM Scored" />
              <ToggleFacet attribute="is_reviewed_by_user" label="Reviewed" />
            </Stack>
            <FacetFilter name="career_stage" label="Career Stage" />
            <FacetFilter name="interests.name" label="Interests" isSearchEnabled />
            <FacetFilter name="skills.name" label="Skills" isSearchEnabled />
            <FacetFilter name="country" label="Country" isSearchEnabled />
            <FacetFilter name="company" label="Company" isSearchEnabled />
            <FacetFilter name="seeking_work" label="Seeking Work" />
            <FacetFilter name="recruitment" label="Recruitment" />
          </Stack>
        </Flex>
      </Stack>
    </InstantSearch>
  );
}

type AlgoliaState = ReturnType<typeof useAlgoliaSearchClient>;
type WithNonNullable<T, Key extends keyof T> = Omit<T, Key> & {
  [key in Key]-?: NonNullable<T[key]>;
};
type AlgoliaStateLoaded = WithNonNullable<
  AlgoliaState,
  | "client"
  | "indexNameProfiles"
  | "indexNameProfilesSortedByUser"
  | "indexNameProfilesSortedByNewest"
>;

function AlgoliaSortControl(props: { algolia: AlgoliaStateLoaded }) {
  const sort = useSortBy({
    items: [
      { value: props.algolia.indexNameProfiles, label: "LLM Score" },
      { value: props.algolia.indexNameProfilesSortedByUser, label: "Your Score" },
      { value: props.algolia.indexNameProfilesSortedByNewest, label: "Newest" },
    ],
  });

  return (
    <SegmentGroup.Root
      value={sort.currentRefinement}
      onValueChange={event => sort.refine(event.value!)}
      size="sm"
      {...ids.set(ids.profile.listControls.sort)}
      h="fit-content"
    >
      <SegmentGroup.Indicator />
      <SegmentGroup.Items items={sort.options} />
    </SegmentGroup.Root>
  );
}

function isAlgoliaLoaded(algolia: AlgoliaState): algolia is AlgoliaStateLoaded {
  return Boolean(
    algolia.client &&
      algolia.indexNameProfiles &&
      algolia.indexNameProfilesSortedByUser &&
      algolia.indexNameProfilesSortedByNewest,
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
        placeholder="Search"
        {...ids.set(ids.profile.searchInput)}
      />
    </InputGroup>
  );
}

function ProfileListHits() {
  const hits = useHits<ProfileFragmentType>();
  const pagination = usePagination();
  const search = useSearchBox();
  const { items: profilesEnriched, isEnrichedByGraphql } = useAlgoliaProfilesEnrichmentByGraphql(
    hits.items,
  );
  const isSearchActive = search.query.length > 0;

  return (
    <Stack gap="gap.xl" w="full">
      <Stack {...ids.set(ids.profile.list)} gap="gap.md2">
        {hits.results?.nbHits && profilesEnriched.length ? (
          profilesEnriched.map(profile => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isSearchActive={isSearchActive}
              isEnrichedByGraphql={isEnrichedByGraphql}
            />
          ))
        ) : (
          <HStack align="center">
            <Text>No profiles found.</Text>
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
                <IconButton key={page.value} variant={{ base: "ghost", _selected: "outline" }}>
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

function FacetFilter(props: { name: string; label: string; isSearchEnabled?: boolean }) {
  const refinements = useRefinementList({
    attribute: props.name,
    limit: 10,
    showMore: true,
  });

  const count = {
    color: useToken("colors", "fg.subtle")[0],
    fontSize: useToken("fontSizes", "sm")[0],
  };

  return (
    <Stack align="flex-start">
      <Text>{props.label}</Text>

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
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label display="inline-flex" gap="gap.sm" color="fg.dark-friendly">
                <Text
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: clean
                  dangerouslySetInnerHTML={{
                    __html:
                      item.highlighted! +
                      `&nbsp;<span style="margin-left: 3px; font-size: ${count.fontSize}; color: ${count.color}">${item.count}</span>`,
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

  return (
    <Checkbox.Root
      checked={toggle.value.isRefined}
      onCheckedChange={() => toggle.refine(toggle.value)}
      display="flex"
      alignItems="flex-start"
    >
      <Checkbox.HiddenInput />
      <Checkbox.Control />
      <Checkbox.Label color="fg.dark-friendly">{props.label}</Checkbox.Label>
    </Checkbox.Root>
  );
}
