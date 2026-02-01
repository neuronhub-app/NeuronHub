import {
  ButtonGroup,
  Checkbox,
  Flex,
  For,
  HStack,
  IconButton,
  Input,
  Pagination,
  SegmentGroup,
  Stack,
  Text,
} from "@chakra-ui/react";
import { getUnixTime, subDays } from "date-fns";
import { useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import {
  Configure,
  InstantSearch,
  useHits,
  usePagination,
  useRefinementList,
  useSearchBox,
  useSortBy,
} from "react-instantsearch";
import { NavLink } from "react-router";
import { useAlgoliaPostsEnrichmentByGraphql } from "@/apps/posts/list/useAlgoliaPostsEnrichmentByGraphql";
import { useUser } from "@/apps/users/useUserCurrent";
import { PostCard, PostCardSkeleton } from "@/components/posts/PostCard/PostCard";
import { Button } from "@/components/ui/button";
import { ids } from "@/e2e/ids";
import type { PostFragmentType } from "@/graphql/fragments/posts";
import { gap } from "@/theme/theme";
import { urls } from "@/urls";
import { useAlgoliaSearchClient } from "@/utils/useAlgoliaSearchClient";
import type { PostCategory } from "~/graphql/enums";

export function PostListAlgolia(props: { category?: PostCategory }) {
  const algolia = useAlgoliaSearchClient();
  const user = useUser();

  if (algolia.loading) {
    return <p>Loading Algolia...</p>;
  }
  if (!isAlgoliaLoaded(algolia)) {
    return <p>Search not available</p>;
  }

  return (
    <InstantSearch
      searchClient={algolia.client}
      indexName={algolia.indexName}
      routing
      future={{ preserveSharedStateOnUnmount: true }}
    >
      <Stack gap="gap.lg">
        <HStack gap="gap.lg" flexWrap="wrap" justify="space-between">
          <TopSegmentSort algolia={algolia} category={props.category} />

          <Flex gap="gap.md">
            <SearchInput />

            {user?.id && (
              <NavLink to={urls.posts.create}>
                <Button variant="subtle">Create Post</Button>
              </NavLink>
            )}
          </Flex>
        </HStack>

        <Flex flex="1" pos="relative" gap="gap.xl">
          <PostListHits />

          <Stack
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
            <FacetFilter name="tags.name" label="Tags" isSearchEnabled />
            <FacetFilter name="tool_type" label="Tool Type" />
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
  "client" | "indexName" | "indexNameSortedByVotes"
>;

function isAlgoliaLoaded(algolia: AlgoliaState): algolia is AlgoliaStateLoaded {
  return Boolean(algolia.client && algolia.indexName && algolia.indexNameSortedByVotes);
}

function TopSegmentSort(props: { algolia: AlgoliaStateLoaded; category?: PostCategory }) {
  const sort = useSortBy({
    items: [
      { value: props.algolia.indexName, label: "Newest" },
      { value: props.algolia.indexNameSortedByVotes, label: "Best" },
    ],
  });

  type DateGteDays = "1" | "2" | "7" | "all";
  const [dateGteDays, setDateGteDays] = useState<DateGteDays>("7");

  let dateGte = null;
  if (dateGteDays !== "all") {
    dateGte = getUnixTime(subDays(new Date(), Number(dateGteDays)));
  }
  const filters = {
    category: props.category ? `type:Post AND category:${props.category}` : "type:Post",
    date: dateGte ? `created_at_unix_aggregated >= ${dateGte}` : "",
  };
  return (
    <Flex gap="gap.md">
      <Configure
        filters={[filters.category, filters.date].filter(Boolean).join(" AND ")}
        hitsPerPage={20}
      />

      <SegmentGroup.Root
        value={sort.currentRefinement}
        onValueChange={event => sort.refine(event.value!)}
        size="sm"
        {...ids.set(ids.post.listControls.sort)}
      >
        <SegmentGroup.Indicator />
        <SegmentGroup.Items items={sort.options} />
      </SegmentGroup.Root>

      <SegmentGroup.Root
        value={dateGteDays}
        onValueChange={event => setDateGteDays(event.value as unknown as DateGteDays)}
        size="sm"
        {...ids.set(ids.post.listControls.dateRange)}
      >
        <SegmentGroup.Indicator />
        <SegmentGroup.Items
          items={[
            { value: "1", label: "1d" },
            { value: "2", label: "2d" },
            { value: "7", label: "7d" },
            { value: "30", label: "30d" },
            { value: "all", label: "All" },
          ]}
        />
      </SegmentGroup.Root>
    </Flex>
  );
}

function SearchInput() {
  const search = useSearchBox();

  return (
    <Input
      value={search.query}
      onChange={event => search.refine(event.target.value)}
      type="search"
      placeholder="Search"
      maxW="lg"
    />
  );
}

function PostListHits() {
  const hits = useHits<PostFragmentType>();

  const pagination = usePagination();

  const postsEnriched = useAlgoliaPostsEnrichmentByGraphql(hits.items);

  return (
    <Stack gap="gap.xl" w="full">
      <Stack {...ids.set(ids.post.list)}>
        {hits.results?.nbHits ? (
          postsEnriched.length ? (
            postsEnriched.map(post => (
              <PostCard
                key={post.id}
                post={post}
                urlNamespace="posts"
                isPageListCompact={true}
              />
            ))
          ) : (
            <>
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
            </>
          )
        ) : (
          <HStack align="center">
            <Text>No matches found.</Text>
            <Button variant="ghost" size="sm">
              Reset filters
            </Button>
          </HStack>
        )}
      </Stack>

      {pagination.nbHits > 0 && (
        <Pagination.Root
          count={pagination.nbHits}
          pageSize={hits.results?.hitsPerPage}
          page={pagination.currentRefinement + 1}
          onPageChange={details => {
            const pageNew = details.page - 1;
            pagination.refine(pageNew);
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
  name: "tags.name" | "tool_type";
  label: string;
  isSearchEnabled?: boolean;
}) {
  const refinements = useRefinementList({
    attribute: props.name,
    limit: 10,
    showMore: true,
  });

  if (refinements.items.length === 0) {
    return null;
  }

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
