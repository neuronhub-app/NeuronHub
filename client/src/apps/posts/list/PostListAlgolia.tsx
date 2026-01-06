import {
  Checkbox,
  Flex,
  For,
  Heading,
  HStack,
  Icon,
  Pagination,
  Stack,
  Text,
} from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa6";
import {
  Configure,
  InstantSearch,
  useHits,
  useInstantSearch,
  usePagination,
  useRefinementList,
} from "react-instantsearch";
import { NavLink } from "react-router";
import { useAlgoliaPostsEnrichmentByGraphql } from "@/apps/posts/list/useAlgoliaPostsEnrichmentByGraphql";
import { PostCard } from "@/components/posts/PostCard/PostCard";
import { Button } from "@/components/ui/button";
import { ids } from "@/e2e/ids";
import type { PostFragmentType } from "@/graphql/fragments/posts";
import { gap } from "@/theme/theme";
import { useAlgoliaSearchClient } from "@/utils/useAlgoliaSearchClient";
import type { PostCategory } from "~/graphql/enums";

export function PostListAlgolia(props: { category?: PostCategory }) {
  const algolia = useAlgoliaSearchClient();

  if (algolia.loading) {
    return <p>Loading Algolia...</p>;
  }
  if (!algolia.client) {
    return <p>Search not available</p>;
  }

  const filters = props.category ? `type:Post AND category:${props.category}` : "type:Post";

  return (
    <InstantSearch
      searchClient={algolia.client}
      indexName={algolia.indexName}
      routing
      future={{
        preserveSharedStateOnUnmount: true,
      }}
    >
      <Configure filters={filters} hitsPerPage={20} />

      <Stack gap="gap.lg">
        <HStack justify="space-between">
          <HStack gap="gap.md">
            <Heading size="2xl">{props.category ? `${props.category} Posts` : "Posts"}</Heading>
          </HStack>

          <NavLink to="/posts/create">
            <Button size="md" variant="subtle">
              <Icon boxSize={3}>
                <FaPlus />
              </Icon>
              Create
            </Button>
          </NavLink>
        </HStack>

        <Flex flex="1" pos="relative" gap="gap.xl">
          <PostListResults />
          <FacetsTags />
        </Flex>
      </Stack>
    </InstantSearch>
  );
}

function PostListResults() {
  const search = useInstantSearch();
  const searchState = useHits<PostFragmentType>();
  const pagination = usePagination();

  const postsEnriched = useAlgoliaPostsEnrichmentByGraphql(searchState.items);

  if (search.status === "loading" || search.status === "stalled") {
    return <p>Loading...</p>;
  }

  return (
    <Stack gap="gap.xl" w="full">
      <Stack gap="gap.xl" {...ids.set(ids.post.list)}>
        <For each={postsEnriched} fallback={<Heading>No posts yet</Heading>}>
          {post => <PostCard key={post.id} post={post} urlNamespace="posts" />}
        </For>
      </Stack>

      <Pagination.Root
        count={pagination.nbHits}
        pageSize={1}
        page={pagination.currentRefinement + 1}
        onPageChange={details => {
          const pageNew = details.page - 1;
          pagination.refine(pageNew);
        }}
        siblingCount={5}
      >
        <Pagination.PrevTrigger />
        <Pagination.Items render={page => <Pagination.Item key={page.value} {...page} />} />
        <Pagination.NextTrigger />
      </Pagination.Root>
    </Stack>
  );
}

function FacetsTags() {
  const refinements = useRefinementList({
    attribute: "tag_names",
    limit: 10,
    showMore: true,
  });

  if (refinements.items.length === 0) {
    return null;
  }

  return (
    <Stack
      pos="sticky"
      hideBelow="lg"
      p={{ base: gap.md, md: gap.lg }}
      gap="gap.sm"
      alignSelf="flex-start"
      borderRadius="md"
      bg="bg.panel"
    >
      <Text>Tags</Text>

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
              <Checkbox.Label textWrap="nowrap">
                {item.label} ({item.count})
              </Checkbox.Label>
            </Checkbox.Root>
          )}
        </For>
      </Stack>
    </Stack>
  );
}
