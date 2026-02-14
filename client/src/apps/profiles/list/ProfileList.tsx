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
  useSortBy,
  useToggleRefinement,
} from "react-instantsearch";
import { AiMatchingButtonTrigger } from "@/apps/profiles/list/AiMatchingButtonTrigger";
import { AiMatchingProgressBar } from "@/apps/profiles/list/AiMatchingProgressBar";
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
      <Stack gap="gap.lg" w="100%">
        <HStack gap="gap.lg" flexWrap="wrap" justify="space-between">
          <Flex gap="14" align="center">
            <Text fontSize="2xl" fontWeight="bold">
              Profiles
            </Text>
            <Flex align="center" gap="gap.md" fontSize="sm" color="fg.subtle">
              <Text mt="2px">Sort by</Text>
              <AlgoliaSortControl algolia={algolia} />
            </Flex>
          </Flex>
          <HStack gap="gap.md">
            <AiMatchingButtonTrigger />
            <SearchInput />
          </HStack>
        </HStack>

        <AiMatchingProgressBar />

        <Configure
          hitsPerPage={20}
          attributesToSnippet={["biography:60", "seeks:30", "offers:30"]}
          attributesToHighlight={[
            "biography",
            "seeks",
            "offers",
            "first_name",
            "last_name",
            "job_title",
            "company",
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
            borderRadius="lg"
            borderColor={{ _light: "bg.muted/70", _dark: "bg.muted/70" }}
            bg="bg.panel"
          >
            <ActiveRefinements />
            <Stack gap="gap.sm">
              <Text {...style.facets.label}>AI Match Status</Text>
              <ToggleFacet attribute="is_scored_by_llm" label="Scored by AI" />
              <ToggleFacet attribute="is_reviewed_by_user" label="Reviewed by you" />
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
      { value: props.algolia.indexNameProfiles, label: "AI Score" },
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
      bg="bg.panel"
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
        bg="bg.panel"
        borderRadius="md"
        border="0"
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
      <Stack {...ids.set(ids.profile.list)} gap="gap.xl">
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

// #AI
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
                is_scored_by_llm: "Scored by AI",
                is_reviewed_by_user: "Reviewed by you",
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
      <Checkbox.Label {...style.facets.value}>{props.label}</Checkbox.Label>
    </Checkbox.Root>
  );
}
