import { Flex, For, Heading, HStack, Icon, Stack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { FaPlus } from "react-icons/fa6";
import { NavLink } from "react-router";

import { ReviewListSidebar } from "@/apps/reviews/list/ReviewListSidebar";
import { PostCard } from "@/components/posts/PostCard";
import { Button } from "@/components/ui/button";
import { ids } from "@/e2e/ids";
import type { PostFragmentType } from "@/graphql/fragments/posts";
import type { PostReviewFragmentType } from "@/graphql/fragments/reviews";
import { PostCategory } from "~/graphql/enums";

export type PostListItemType = PostFragmentType | PostReviewFragmentType;

export type PostContentField = keyof Pick<
  PostListItemType,
  "content_polite" | "content_direct" | "content_rant"
>;

// todo refac-name: PostList
export function ListContainer(props: {
  title?: string;
  category?: PostCategory;
  items: Array<PostListItemType>;
  urlNamespace: "reviews" | "posts" | "tools";
  isLoadingFirstTime: boolean;
  error?: Error | null;
  children?: ReactNode;
}) {
  return (
    <Stack gap="gap.lg">
      <HStack justify="space-between">
        <HStack gap="gap.md">
          <Heading size="2xl">
            {props.title ? props.title : (getPostCategoryName(props.category) ?? "Posts")}
          </Heading>
        </HStack>

        <NavLink to={`/${props.urlNamespace}/create`}>
          <Button size="md" variant="subtle">
            <Icon boxSize={3}>
              <FaPlus />
            </Icon>
            Create
          </Button>
        </NavLink>
      </HStack>

      {props.isLoadingFirstTime && <p>Loading...</p>}
      {props.error && <p>Error: {props.error.message}</p>}

      <Flex flex="1" pos="relative" gap="gap.xl">
        <Stack gap="gap.xl">
          <For
            each={props.items}
            fallback={<Heading>No posts yet</Heading>}
            {...ids.set(ids.post.list)}
          >
            {post => <PostCard key={post.id} post={post} urlNamespace={props.urlNamespace} />}
          </For>
        </Stack>

        <ReviewListSidebar />
      </Flex>
    </Stack>
  );
}

function getPostCategoryName(category?: PostCategory) {
  if (!category) {
    return;
  }
  switch (category) {
    case PostCategory.Opinion:
      return "Opinions";
    case PostCategory.Question:
      return "Questions";
  }
  return category;
}
