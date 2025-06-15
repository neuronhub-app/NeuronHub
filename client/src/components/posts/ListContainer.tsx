import { ReviewListSidebar } from "@/apps/reviews/list/ReviewListSidebar";
import { PostCard } from "@/components/posts/PostCard";
import { PostAuthor } from "@/components/posts/PostCard/PostAuthor";
import { PostButtons } from "@/components/posts/PostCard/PostButtons";
import { PostButtonsVote } from "@/components/posts/PostCard/PostButtonsVote";
import { ToolTags } from "@/components/tools/ToolTags";
import { Button } from "@/components/ui/button";
import type { PostFragmentType } from "@/graphql/fragments/posts";
import type { PostReviewFragmentType } from "@/graphql/fragments/reviews";
import { getOutlineContrastStyle } from "@/utils/getOutlineContrastStyle";
import {
  Flex,
  For,
  HStack,
  Heading,
  Icon,
  IconButton,
  Link,
  Show,
  Stack,
  Text,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import { BsChatLeftTextFill } from "react-icons/bs";
import { FaGithub, FaPlus } from "react-icons/fa6";
import { SiCrunchbase } from "react-icons/si";
import { NavLink } from "react-router";
import type { CombinedError } from "urql";

export type PostListItemType = PostFragmentType | PostReviewFragmentType;

export function ListContainer(props: {
  title: string;
  items: Array<PostListItemType>;
  urlNamespace: "reviews" | "posts";
  isLoading: boolean;
  error?: CombinedError;
  children?: ReactNode;
}) {
  return (
    <Stack gap="gap.lg">
      <HStack justify="space-between">
        <Heading size="2xl">{props.title}</Heading>

        <NavLink to={`/${props.urlNamespace}/create`}>
          <Button size="md" variant="subtle">
            <Icon boxSize={3}>
              <FaPlus />
            </Icon>
            Create
          </Button>
        </NavLink>
      </HStack>

      {props.isLoading && <p>Loading...</p>}
      {props.error && <p>Error: {props.error.message}</p>}

      <Flex flex="1" pos="relative" gap="gap.xl">
        <Stack gap="gap.xl">
          <For each={props.items} fallback={<Heading>No reviews yet</Heading>}>
            {post => (
              <HStack key={post.id} gap="gap.md" align="flex-start">
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

                  {post.parent && <ToolTags tags={post.parent.tags} />}

                  <HStack justify="space-between">
                    <PostAuthor author={post.author} />

                    <HStack gap="gap.md" fontSize="sm">
                      <Show when={post.source}>
                        <Link href={post.source}>Source</Link>
                      </Show>

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
                          Github
                        </Link>
                      )}
                    </HStack>
                  </HStack>

                  <NavLink to={`/${props.urlNamespace}/${post.id}`}>
                    <IconButton
                      variant="plain"
                      colorPalette="gray"
                      aria-label="Comments"
                      color="gray.300"
                      _hover={{ color: "slate.400" }}
                    >
                      <BsChatLeftTextFill /> <Text color="gray.400">{post.children.length}</Text>
                    </IconButton>
                  </NavLink>
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
