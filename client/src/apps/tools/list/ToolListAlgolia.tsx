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
  Stack,
  Text,
  useToken,
} from "@chakra-ui/react";
import { getUnixTime, subDays } from "date-fns";
import { useRef, useState } from "react";
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
import { NavLink } from "react-router";
import { useAlgoliaToolsEnrichmentByGraphql } from "@/apps/tools/list/useAlgoliaToolsEnrichmentByGraphql";
import { useUser } from "@/apps/users/useUserCurrent";
import { PostCard, PostCardSkeleton } from "@/components/posts/PostCard/PostCard";
import { Button } from "@/components/ui/button";
import { ids } from "@/e2e/ids";
import type { PostFragmentType } from "@/graphql/fragments/posts";
import { gap } from "@/theme/theme";
import { urls } from "@/urls";
import { useAlgoliaSearchClient } from "@/utils/useAlgoliaSearchClient";

export function ToolListAlgolia() {
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
              Tools
            </Text>
            <TopSegmentSort algolia={algolia} />
          </Flex>

          <Flex gap="gap.md">
            <SearchInput />
            {user?.id && (
              <NavLink to={urls.tools.create}>
                <Button variant="subtle">Create Tool</Button>
              </NavLink>
            )}
          </Flex>
        </HStack>

        <Flex flex="1" pos="relative" gap="gap.xl">
          <ToolListHits />

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
            <FacetFilter name="tool_type" label="Tool Type" />
            <FacetFilter name="tags.name" label="Tags" isSearchEnabled />
            <ToggleFacet attribute="has_github_url" label="Has GitHub Link" />
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
        filters={["type:tool", dateFilter].filter(Boolean).join(" AND ")}
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
        placeholder="Search tools"
        bg="bg.panel"
        borderRadius="md"
        border="0"
      />
    </InputGroup>
  );
}

function ToolListHits() {
  const hits = useHits<PostFragmentType>();
  const pagination = usePagination();
  const { items: toolsEnriched } = useAlgoliaToolsEnrichmentByGraphql(hits.items);

  return (
    <Stack gap="gap.xl" w="full">
      <Stack {...ids.set(ids.post.list)}>
        {hits.results?.nbHits ? (
          toolsEnriched.length ? (
            toolsEnriched.map(tool => (
              <PostCard key={tool.id} post={tool} urlNamespace="tools" />
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
            <Text>No tools found.</Text>
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
