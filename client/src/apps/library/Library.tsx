import { Box, Flex, Heading, HStack, IconButton, Stack, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { FaComments } from "react-icons/fa";
import { NavLink } from "react-router";
import { PostContentHighlighted } from "@/apps/highlighter/PostContentHighlighted";
import { useHighlighter } from "@/apps/highlighter/useHighlighter";
import { PostCard } from "@/components/posts/PostCard";
import { PostAuthor } from "@/components/posts/PostCard/PostAuthor";
import { PostDatetime } from "@/components/posts/PostCard/PostDatetime";
import { graphql, type ID, type ResultOf } from "@/gql-tada";
import {
  CommentFieldsFragment,
  PostCommentsFragment,
  PostFragment,
} from "@/graphql/fragments/posts";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { urls } from "@/routes";
import { getOutlineContrastStyle } from "@/utils/getOutlineContrastStyle";

const UserHighlightsQuery = graphql(
  `
    query UserHighlights {
      user_highlights {
        id
        text
        text_prefix
        text_postfix
        created_at

        post {
          ...CommentFieldsFragment
          ...PostCommentsFragment
        }
        root_post {
          ...PostFragment
          ...PostCommentsFragment
        }
      }
    }
  `,
  [CommentFieldsFragment, PostFragment, PostCommentsFragment],
);

type HighlightGroup = {
  root_post: HighlightType["root_post"];
  highlights: Array<{
    id: ID;
    text: HighlightType["text"];
    created_at: HighlightType["created_at"];
    post: HighlightType["post"];
  }>;
};
export type HighlightType = ResultOf<typeof UserHighlightsQuery>["user_highlights"][number];

function groupHighlightsByPost(highlights: HighlightType[]): HighlightGroup[] {
  const groups = new Map<ID, HighlightGroup>();

  for (const highlight of highlights) {
    if (!highlight.root_post) {
      continue;
    }

    if (!groups.has(highlight.root_post.id)) {
      groups.set(highlight.root_post.id, {
        root_post: highlight.root_post,
        highlights: [],
      });
    }

    const postHighlights = groups.get(highlight.root_post.id)!.highlights;
    const isHighlightUnique = !postHighlights.find(h => h.post.id === highlight.post.id);
    if (isHighlightUnique) {
      postHighlights.push({
        id: highlight.id,
        text: highlight.text,
        created_at: highlight.created_at,
        post: highlight.post,
      });
    }
  }
  return [...groups.values()];
}

export function Library() {
  const { data, error, isLoadingFirstTime } = useApolloQuery(UserHighlightsQuery, {});

  const groupedHighlights = useMemo(
    () => groupHighlightsByPost(data?.user_highlights ?? ([] satisfies HighlightType[])),
    [data?.user_highlights],
  );

  const postsFromGroups = useMemo(() => {
    const posts: Array<HighlightType["post"]> = [];
    for (const group of groupedHighlights) {
      for (const highlight of group.highlights) {
        posts.push(highlight.post);
      }
    }
    return posts;
  }, [groupedHighlights]);

  const highlighter = useHighlighter({ posts: postsFromGroups });

  return (
    <Stack gap="gap.lg">
      <Heading size="2xl">Library</Heading>

      {isLoadingFirstTime && <Text>Loading highlights...</Text>}
      {error && <Text color="fg.error">Error: {error.message}</Text>}

      <Stack gap="gap.lg">
        {groupedHighlights.map(group => (
          <Stack
            key={group.root_post.id}
            gap="gap.sm"
            bg="bg.subtle"
            p="gap.lg"
            borderRadius="lg"
            {...getOutlineContrastStyle({ variant: "subtle" })}
          >
            <PostCard post={group.root_post} />

            <Flex gap="gap.lg">
              <PostAuthor post={group.root_post} />
              <NavLink
                to={urls.getPostUrls(group.root_post).detail}
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
                  <FaComments /> <Text color="gray.400">{group.root_post.comments_count}</Text>
                </IconButton>
              </NavLink>
            </Flex>

            <Stack aria-label="author & date" gap="gap.md">
              {group.highlights.map(highlight => (
                <Stack gap="gap.sm" key={highlight.id}>
                  <Text fontSize="xs" color="fg.subtle">
                    Highlighted <PostDatetime datetimeStr={highlight.created_at} size="xs" />
                  </Text>

                  <Box
                    bg="bg.panel"
                    p="gap.md"
                    pb="gap.sm"
                    borderRadius="md"
                    borderLeftWidth="3px"
                    borderColor="colorPalette.solid"
                  >
                    <Stack aria-label="author & date" gap="gap.xs" mb="gap.sm">
                      <HStack gap="gap.sm">
                        <Text fontSize="sm" color="fg.muted">
                          {highlight.post.source_author || highlight.post.author?.username}
                        </Text>

                        <PostDatetime
                          datetimeStr={
                            highlight.post.post_source?.created_at_external ??
                            highlight.post.created_at
                          }
                          size="xs"
                        />
                      </HStack>
                    </Stack>

                    <PostContentHighlighted post={highlighter.highlight(highlight.post)} />
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
