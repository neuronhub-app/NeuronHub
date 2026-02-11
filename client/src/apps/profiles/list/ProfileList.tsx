import {
  ButtonGroup,
  Checkbox,
  Flex,
  For,
  HStack,
  IconButton,
  Input,
  Pagination,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import {
  Configure,
  InstantSearch,
  useHits,
  usePagination,
  useRefinementList,
  useSearchBox,
} from "react-instantsearch";
import { ProfileCard } from "@/apps/profiles/list/ProfileCard/ProfileCard";
import { useAlgoliaProfilesEnrichmentByGraphql } from "@/apps/profiles/list/useAlgoliaProfilesEnrichmentByGraphql";
import { Button } from "@/components/ui/button";
import type { ProfileFragmentType } from "@/graphql/fragments/profiles";
import { gap } from "@/theme/theme";
import { useAlgoliaSearchClient } from "@/utils/useAlgoliaSearchClient";

export function ProfileList() {
  const algolia = useAlgoliaSearchClient();

  if (algolia.loading) {
    return <p>Loading Algolia...</p>;
  }
  if (!algolia.client || !algolia.indexNameProfiles) {
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
          <Text fontSize="xl" fontWeight="bold">
            Profiles
          </Text>
          <SearchInput />
        </HStack>

        <Configure hitsPerPage={30} />

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
            minW={{ base: "", md: "3xs" }}
            gap="gap.md"
            borderRadius="md"
            border="1px solid"
            borderColor={{ _light: "bg.muted/70", _dark: "bg.muted/70" }}
            bg={{ _light: "bg.subtle/30", _dark: "bg.subtle" }}
          >
            <FacetFilter name="skills" label="Skills" isSearchEnabled isShowEmpty />
            <FacetFilter name="interests" label="Interests" isSearchEnabled isShowEmpty />
            <FacetFilter name="country" label="Country" isShowEmpty />
            <FacetFilter name="career_stage" label="Career Stage" />
          </Stack>
        </Flex>
      </Stack>
    </InstantSearch>
  );
}

function SearchInput() {
  const search = useSearchBox();

  return (
    <Input
      value={search.query}
      onChange={event => search.refine(event.target.value)}
      type="search"
      placeholder="Search profiles"
      maxW="lg"
    />
  );
}

function ProfileListHits() {
  const hits = useHits<ProfileFragmentType>();
  const pagination = usePagination();
  const profilesEnriched = useAlgoliaProfilesEnrichmentByGraphql(hits.items);

  return (
    <Stack gap="gap.xl" w="full">
      <Stack>
        {hits.results?.nbHits ? (
          profilesEnriched.length ? (
            profilesEnriched.map(profile => <ProfileCard key={profile.id} profile={profile} />)
          ) : (
            <>
              <Skeleton h="10" />
              <Skeleton h="10" />
              <Skeleton h="10" />
            </>
          )
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

function FacetFilter(props: {
  name: string;
  label: string;
  isSearchEnabled?: boolean;
  isShowEmpty?: boolean;
}) {
  const refinements = useRefinementList({
    attribute: props.name,
    limit: 10,
    showMore: true,
  });

  const isEmpty = refinements.items.length === 0;

  if (isEmpty && !props.isShowEmpty) {
    return null;
  }

  return (
    <Stack align="flex-start">
      <Text>{props.label}</Text>

      {props.isSearchEnabled && !isEmpty && (
        <Input
          onChange={event => refinements.searchForItems(event.target.value)}
          type="search"
          placeholder="Search..."
          size="xs"
        />
      )}

      {isEmpty && (
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
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label textWrap="nowrap" display="flex" gap="gap.sm" color="fg.muted">
                <Text
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: clean
                  dangerouslySetInnerHTML={{ __html: item.highlighted! }}
                  as="span"
                />{" "}
                <Text as="span" color="fg.subtle" fontSize="xs">
                  {item.count}
                </Text>
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
          {refinements.hasExhaustiveItems ? "Collapse" : "Show more"}
        </Button>
      )}
    </Stack>
  );
}
