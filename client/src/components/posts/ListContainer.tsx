import {
  Flex,
  For,
  Heading,
  HStack,
  Icon,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import { FaComments, FaHackerNewsSquare } from "react-icons/fa";
import { FaGithub, FaPlus } from "react-icons/fa6";
import { SiCrunchbase } from "react-icons/si";
import { NavLink } from "react-router";
import { ReviewListSidebar } from "@/apps/reviews/list/ReviewListSidebar";
import { PostCard } from "@/components/posts/PostCard";
import { PostAuthor } from "@/components/posts/PostCard/PostAuthor";
import { PostButtons } from "@/components/posts/PostCard/PostButtons";
import { PostButtonsVote } from "@/components/posts/PostCard/PostButtonsVote";
import { Button } from "@/components/ui/button";
import { ids } from "@/e2e/ids";
import type { PostFragmentType } from "@/graphql/fragments/posts";
import type { PostReviewFragmentType } from "@/graphql/fragments/reviews";
import { getOutlineContrastStyle } from "@/utils/getOutlineContrastStyle";
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
        <Heading size="2xl">
          {props.title ? props.title : (getPostCategoryName(props.category) ?? "Posts")}
        </Heading>

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
            fallback={<Heading>No reviews yet</Heading>}
            {...ids.set(ids.post.list)}
          >
            {post => (
              <HStack as="article" key={post?.id} gap="gap.md" align="flex-start">
                <Stack>
                  <PostButtonsVote post={post} />
                  <PostButtons post={post} />
                </Stack>

                <Stack
                  w="full"
                  gap="gap.md"
                  bg="bg.light"
                  p="gap.md"
                  borderRadius="lg"
                  {...getOutlineContrastStyle({ variant: "subtle" })}
                >
                  <PostCard post={post} />

                  <HStack justify="space-between" align="flex-end">
                    <Flex gap="gap.lg">
                      <PostAuthor post={post} />
                      <NavLink
                        to={`/${props.urlNamespace}/${post.id}`}
                        style={{ width: "min-content" }}
                      >
                        <IconButton
                          variant="plain"
                          colorPalette="gray"
                          aria-label="Comments"
                          color="gray.300"
                          _hover={{ color: "slate.400" }}
                          size="sm"
                          h="auto"
                        >
                          <FaComments />{" "}
                          <Text color="gray.400">{countCommentsRecursively(post.comments)}</Text>
                        </IconButton>
                      </NavLink>
                    </Flex>

                    <Flex gap="gap.md" fontSize="sm">
                      {post.source && (
                        <Link href={post.source}>
                          {post.source.includes("news.ycombinator.com") && (
                            <FaHackerNewsSquare />
                          )}{" "}
                          Source
                        </Link>
                      )}

                      {post.crunchbase_url && (
                        <Link
                          href={`https://${post.crunchbase_url}`}
                          color="fg.subtle"
                          variant="underline"
                        >
                          <Icon>
                            <SiCrunchbase />
                          </Icon>
                          Crunchbase
                        </Link>
                      )}

                      {post.github_url && (
                        <Link
                          href={`https://${post.github_url}`}
                          color="fg.subtle"
                          variant="underline"
                        >
                          <Icon>
                            <FaGithub />
                          </Icon>
                          GitHub
                        </Link>
                      )}
                    </Flex>
                  </HStack>
                </Stack>
              </HStack>
            )}
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

export function countCommentsRecursively(comments?: PostFragmentType["comments"]) {
  if (!comments) {
    return 0;
  }
  let count = comments.length;
  for (const comment of comments) {
    if (comment.comments) {
      // @ts-expect-error #bad-infer
      count += countCommentsRecursively(comment.comments);
    }
  }
  return count;
}
