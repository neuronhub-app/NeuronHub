import { Flex, HStack, SegmentGroup, Stack, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  Configure,
  InstantSearch,
  useCurrentRefinements,
  useSearchBox,
} from "react-instantsearch";
import { AiMatchingButtonTrigger } from "@/apps/profiles/list/AiMatchingButtonTrigger";
import { AiMatchingProgressBar } from "@/apps/profiles/list/AiMatchingProgressBar";
import { ProfileCard } from "@/apps/profiles/list/ProfileCard/ProfileCard";
import { useProfilesSortedByDjango } from "@/apps/profiles/list/useProfilesSortedByDjango";
import { AlgoliaFacetAttribute } from "@/components/algolia/AlgoliaFacetAttribute";
import { AlgoliaFacetBoolean } from "@/components/algolia/AlgoliaFacetBoolean";
import { AlgoliaFacets, facetStyle } from "@/components/algolia/AlgoliaFacets";
import { AlgoliaFacetsActive } from "@/components/algolia/AlgoliaFacetsActive";
import { AlgoliaHits } from "@/components/algolia/AlgoliaList";
import { AlgoliaPagination } from "@/components/algolia/AlgoliaPagination";
import { AlgoliaSearchInput } from "@/components/algolia/AlgoliaSearchInput";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import { ProfileFragment, type ProfileFragmentType } from "@/graphql/fragments/profiles";
import { useAlgoliaSearchClient } from "@/utils/useAlgoliaSearchClient";

const algoliaIndexName = "newest" as const;
type SortOption = "llm_score" | "user_score" | typeof algoliaIndexName;

export function ProfileList() {
  const algolia = useAlgoliaSearchClient();
  const [sort, setSort] = useState<SortOption>(algoliaIndexName);

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
      <ProfileListInner sort={sort} setSort={setSort} />
    </InstantSearch>
  );
}

// #AI
function ProfileListInner(props: { sort: SortOption; setSort: (sort: SortOption) => void }) {
  const search = useSearchBox();
  const refinements = useCurrentRefinements();

  const isAlgoliaSearchActive = search.query.length > 0 || refinements.items.length > 0;

  const isDjangoMode = props.sort !== algoliaIndexName && !isAlgoliaSearchActive;

  // reset to Algolia index if User makes isAlgoliaSearchActive
  useEffect(() => {
    if (isAlgoliaSearchActive && props.sort !== algoliaIndexName) {
      props.setSort(algoliaIndexName);
    }
  }, [isAlgoliaSearchActive]);

  return (
    <Stack gap="gap.lg" w="100%">
      <HStack gap="gap.lg" flexWrap="wrap" justify="space-between">
        <Flex gap="14" align="center">
          <Text fontSize="2xl" fontWeight="bold">
            Profiles
          </Text>
          <Flex align="center" gap="gap.md" fontSize="sm" color="fg.subtle">
            <Text mt="2px">Sort by</Text>
            <SortControl sort={props.sort} setSort={props.setSort} />
          </Flex>
        </Flex>
        <HStack gap="gap.md">
          <AiMatchingButtonTrigger />
          <AlgoliaSearchInput testId={ids.profile.searchInput} />
        </HStack>
      </HStack>

      <AiMatchingProgressBar />

      <Configure
        hitsPerPage={20}
        facets={["*"]}
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
          "match_reason_by_llm",
          "match_review",
        ]}
      />

      <Flex flex="1" pos="relative" gap="gap.xl">
        {isDjangoMode ? (
          <DjangoHits sort={props.sort} />
        ) : (
          <AlgoliaHits<ProfileFragmentType>
            enrichment={{
              query: ProfilesByIdsQuery,
              extractItems: data => data.profiles,
            }}
            renderHit={(profile, ctx) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                isSearchActive={ctx.isSearchActive}
                isEnrichedByGraphql={ctx.isEnrichedByGraphql}
              />
            )}
            listTestId={ids.profile.list}
            label="profiles"
          />
        )}

        <AlgoliaFacets isSearchActive={isAlgoliaSearchActive} label="profiles">
          <AlgoliaFacetsActive
            labelsOverride={{
              is_scored_by_llm: "Scored by AI",
              is_reviewed_by_user: "Reviewed by you",
            }}
          />
          <Stack gap="gap.sm">
            <Text {...facetStyle.label}>AI Match Status</Text>
            <AlgoliaFacetBoolean attribute="is_scored_by_llm" label="Scored by AI" />
            <AlgoliaFacetBoolean attribute="is_reviewed_by_user" label="Reviewed by you" />
          </Stack>
          <AlgoliaFacetAttribute attribute="career_stage" label="Career Stage" />
          <AlgoliaFacetAttribute attribute="interests.name" label="Interests" isSearchEnabled />
          <AlgoliaFacetAttribute attribute="skills.name" label="Skills" isSearchEnabled />
          <AlgoliaFacetAttribute attribute="country" label="Country" isSearchEnabled />
          <AlgoliaFacetAttribute attribute="company" label="Company" isSearchEnabled />
          <AlgoliaFacetAttribute attribute="seeking_work" label="Seeking Work" />
          <AlgoliaFacetAttribute attribute="recruitment" label="Recruitment" />
        </AlgoliaFacets>
      </Flex>
    </Stack>
  );
}

// #AI
function SortControl(props: { sort: SortOption; setSort: (sort: SortOption) => void }) {
  const sortOptions: { value: SortOption; label: string; testId: string }[] = [
    {
      value: algoliaIndexName,
      label: "Search Relevance",
      testId: ids.profile.listControls.sortDefault,
    },
    { value: "llm_score", label: "AI Score", testId: ids.profile.listControls.sortAiScore },
    { value: "user_score", label: "Your Score", testId: ids.profile.listControls.sortYourScore },
  ];

  return (
    <SegmentGroup.Root
      value={props.sort}
      onValueChange={event => props.setSort(event.value as SortOption)}
      size="sm"
      {...ids.set(ids.profile.listControls.sort)}
      h="fit-content"
      bg="bg.panel"
    >
      <SegmentGroup.Indicator />
      {sortOptions.map(option => (
        <SegmentGroup.Item key={option.value} value={option.value} {...ids.set(option.testId)}>
          <SegmentGroup.ItemText>{option.label}</SegmentGroup.ItemText>
          <SegmentGroup.ItemHiddenInput />
        </SegmentGroup.Item>
      ))}
    </SegmentGroup.Root>
  );
}

// #AI
function DjangoHits(props: { sort: SortOption }) {
  const [page, setPage] = useState(1);

  const pageSize = 20;

  // Reset page when sort changes
  useEffect(() => {
    setPage(1);
  }, [props.sort]);

  const offset = (page - 1) * pageSize;
  const { items, totalCount, isLoadingFirstTime } = useProfilesSortedByDjango({
    sort: props.sort,
    offset,
    limit: pageSize,
    skip: false,
  });

  if (isLoadingFirstTime) {
    return (
      <Stack gap="gap.xl" w="full">
        <Text color="fg.subtle">Loading...</Text>
      </Stack>
    );
  }

  return (
    <Stack gap="gap.xl" w="full">
      <Stack {...ids.set(ids.profile.list)} gap="gap.xl">
        {items.length > 0 ? (
          items.map(profile => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isSearchActive={false}
              isEnrichedByGraphql={true}
            />
          ))
        ) : (
          <HStack align="center">
            <Text>No profiles found.</Text>
          </HStack>
        )}
      </Stack>

      <AlgoliaPagination
        count={totalCount}
        pageSize={pageSize}
        page={page}
        onPageChange={setPage}
      />
    </Stack>
  );
}

const ProfilesByIdsQuery = graphql.persisted(
  "ProfilesByIds",
  graphql(
    `
    query ProfilesByIds($ids: [ID!]!) {
      profiles(filters: { id: { in_list: $ids } }) {
        ...ProfileFragment
      }
    }
  `,
    [ProfileFragment],
  ),
);
