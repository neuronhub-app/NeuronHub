/**
 * #AI
 */
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
  Slider,
  Stack,
  Text,
  useToken,
} from "@chakra-ui/react";
import { getUnixTime, subDays, subMonths, subYears } from "date-fns";
import { useMemo, useRef, useState } from "react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { LuSearch } from "react-icons/lu";
import {
  Configure,
  InstantSearch,
  useHits,
  useNumericMenu,
  usePagination,
  useRange,
  useRefinementList,
  useSearchBox,
  useSortBy,
} from "react-instantsearch";
import { NavLink } from "react-router";
import { useAlgoliaReviewsEnrichmentByGraphql } from "@/apps/reviews/list/useAlgoliaReviewsEnrichmentByGraphql";
import { useUser } from "@/apps/users/useUserCurrent";
import { PostCard, PostCardSkeleton } from "@/components/posts/PostCard/PostCard";
import { Button } from "@/components/ui/button";
import { ids } from "@/e2e/ids";
import type { PostReviewFragmentType } from "@/graphql/fragments/reviews";
import { gap } from "@/theme/theme";
import { urls } from "@/urls";
import { useAlgoliaSearchClient } from "@/utils/useAlgoliaSearchClient";

export function ReviewListAlgolia() {
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
      indexName={algolia.indexNameSortedByVotes}
      routing
      future={{ preserveSharedStateOnUnmount: true }}
    >
      <Stack gap="gap.lg">
        <HStack gap="gap.lg" flexWrap="wrap" justify="space-between">
          <Flex gap="gap.md" align="center">
            <Text fontSize="2xl" fontWeight="bold">
              Reviews
            </Text>
            <TopSegmentSort algolia={algolia} />
          </Flex>

          <Flex gap="gap.md">
            <SearchInput />
            {user?.id && (
              <NavLink to={urls.reviews.create}>
                <Button variant="subtle">Create Review</Button>
              </NavLink>
            )}
          </Flex>
        </HStack>

        <Flex flex="1" pos="relative" gap="gap.xl">
          <ReviewListHits />

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
            <FacetFilter name="tags.name" label="Tags" isSearchEnabled />
            <FacetFilter name="review_tags.name" label="Review Tags" isSearchEnabled />
            <FacetFilter name="review_usage_status" label="Usage Status" />
            <RangeSliderFacet attribute="review_importance" label="Importance" />
            <RangeSliderFacet attribute="review_experience_hours" label="Experience (hours)" />
            <ReviewedAtFacet />
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

function TopSegmentSort(props: { algolia: AlgoliaStateLoaded }) {
  const sort = useSortBy({
    items: [
      { value: props.algolia.indexNameSortedByVotes, label: "Best" },
      { value: props.algolia.indexName, label: "Newest" },
    ],
  });

  type DateGteDays = "7" | "30" | "all";
  const [dateGteDays, setDateGteDays] = useState<DateGteDays>("all");

  let dateGte = null;
  if (dateGteDays !== "all") {
    dateGte = getUnixTime(subDays(new Date(), Number(dateGteDays)));
  }
  const dateFilter = dateGte ? `created_at_unix_aggregated >= ${dateGte}` : "";

  return (
    <Flex gap="gap.md">
      <Configure
        filters={["type:review", dateFilter].filter(Boolean).join(" AND ")}
        hitsPerPage={35}
      />

      <SegmentGroup.Root
        value={sort.currentRefinement}
        onValueChange={event => sort.refine(event.value!)}
        size="sm"
        h="fit-content"
        bg="bg.panel"
      >
        <SegmentGroup.Indicator />
        <SegmentGroup.Items items={sort.options} />
      </SegmentGroup.Root>

      <SegmentGroup.Root
        value={dateGteDays}
        onValueChange={event => setDateGteDays(event.value as unknown as DateGteDays)}
        size="sm"
        h="fit-content"
        bg="bg.panel"
      >
        <SegmentGroup.Indicator />
        <SegmentGroup.Items
          items={[
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
        placeholder="Search reviews"
        bg="bg.panel"
        borderRadius="md"
        border="0"
      />
    </InputGroup>
  );
}

function ReviewListHits() {
  const hits = useHits<PostReviewFragmentType>();
  const pagination = usePagination();
  const { items: reviewsEnriched } = useAlgoliaReviewsEnrichmentByGraphql(hits.items);

  return (
    <Stack gap="gap.xl" w="full">
      <Stack {...ids.set(ids.post.list)}>
        {hits.results?.nbHits ? (
          reviewsEnriched.length ? (
            reviewsEnriched.map(review => (
              <PostCard key={review.id} post={review} urlNamespace="reviews" />
            ))
          ) : (
            <>
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
            </>
          )
        ) : (
          <HStack align="center">
            <Text>No reviews found.</Text>
          </HStack>
        )}
      </Stack>

      {pagination.nbHits > 0 && (
        <Pagination.Root
          count={pagination.nbHits}
          pageSize={hits.results?.hitsPerPage}
          page={pagination.currentRefinement + 1}
          onPageChange={details => pagination.refine(details.page - 1)}
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

  if (refinements.items.length === 0) {
    return null;
  }

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

      <Stack gap="gap.sm">
        <For each={refinements.items}>
          {item => (
            <Checkbox.Root
              key={item.value}
              checked={item.isRefined}
              onCheckedChange={() => refinements.refine(item.value)}
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
                />
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

function RangeSliderFacet(props: { attribute: string; label: string }) {
  const range = useRange({ attribute: props.attribute });
  const min = range.range.min ?? 0;
  const max = range.range.max ?? 100;
  const currentMin = range.start[0] !== Number.NEGATIVE_INFINITY ? (range.start[0] ?? min) : min;
  const currentMax = range.start[1] !== Number.POSITIVE_INFINITY ? (range.start[1] ?? max) : max;

  if (!range.canRefine || min === max) {
    return null;
  }

  return (
    <Stack align="flex-start">
      <Text {...style.facets.label}>
        {props.label}
        <Text as="span" fontSize="2xs" color="fg.subtle" ml="gap.sm">
          {currentMin}–{currentMax}
        </Text>
      </Text>
      <Slider.Root
        min={min}
        max={max}
        value={[currentMin, currentMax]}
        onValueChangeEnd={event => range.refine(event.value as [number, number])}
        size="sm"
        w="full"
      >
        <Slider.Control>
          <Slider.Track bg="bg.muted">
            <Slider.Range />
          </Slider.Track>
          <Slider.Thumb index={0} />
          <Slider.Thumb index={1} />
        </Slider.Control>
      </Slider.Root>
    </Stack>
  );
}

function ReviewedAtFacet() {
  const now = useMemo(() => new Date(), []);
  const items = useMemo(
    () => [
      { label: "1d", start: getUnixTime(subDays(now, 1)) },
      { label: "7d", start: getUnixTime(subDays(now, 7)) },
      { label: "30d", start: getUnixTime(subDays(now, 30)) },
      { label: "6m", start: getUnixTime(subMonths(now, 6)) },
      { label: "1y", start: getUnixTime(subYears(now, 1)) },
      { label: "2y", start: getUnixTime(subYears(now, 2)) },
      { label: "All" },
    ],
    [now],
  );

  const menu = useNumericMenu({ attribute: "reviewed_at_unix", items });

  return (
    <Stack align="flex-start">
      <Text {...style.facets.label}>Reviewed At</Text>
      <Stack gap="gap.sm">
        <For each={menu.items}>
          {item => (
            <Checkbox.Root
              key={item.label}
              checked={item.isRefined}
              onCheckedChange={() => menu.refine(item.value)}
              display="flex"
              alignItems="center"
              size="sm"
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control />
              <Checkbox.Label {...style.facets.value}>{item.label}</Checkbox.Label>
            </Checkbox.Root>
          )}
        </For>
      </Stack>
    </Stack>
  );
}
