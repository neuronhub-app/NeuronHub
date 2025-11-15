import { Box, Flex, Heading, HStack, IconButton, Stack, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { FaComments } from "react-icons/fa";
import { NavLink } from "react-router";
import { PostContentHighlighted } from "@/apps/highlighter/PostContentHighlighted";
import type { PostHighlight } from "@/apps/highlighter/useHighlighter";
import { PostCard } from "@/components/posts/PostCard";
import { PostAuthor } from "@/components/posts/PostCard/PostAuthor";
import { PostDatetime } from "@/components/posts/PostCard/PostDatetime";
import { graphql, type ID, type ResultOf } from "@/gql-tada";
import { CommentFieldsFragment, PostFragment } from "@/graphql/fragments/posts";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { urls } from "@/urls";
import { getOutlineContrastStyle } from "@/utils/getOutlineContrastStyle";

type HighlightGroup = {
  parent_root: NonNullable<HighlightType["post"]["parent_root"]>;
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
    if (!highlight.post.parent_root) {
      continue;
    }

    if (!groups.has(highlight.post.parent_root.id)) {
      groups.set(highlight.post.parent_root.id, {
        parent_root: highlight.post.parent_root,
        highlights: [],
      });
    }

    const postHighlights = groups.get(highlight.post.parent_root.id)!.highlights;
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

  const highlightsMap = useMemo(() => {
    // todo fix by using a shared Fragment for PostHighlight -> remove Partial<>
    const map: Record<ID, Array<Partial<PostHighlight>>> = {};
    if (data?.user_highlights) {
      for (const highlight of data.user_highlights.filter(h => h.post?.id)) {
        const postId = highlight.post.id;
        if (!map[postId]) {
          map[postId] = [];
        }
        map[postId].push({
          id: highlight.id,
          text: highlight.text,
          text_prefix: highlight.text_prefix,
          text_postfix: highlight.text_postfix,
        });
      }
    }
    return map;
  }, [data?.user_highlights]);

  return (
    <Stack gap="gap.lg">
      <Heading size="2xl">Library</Heading>

      {isLoadingFirstTime && <Text>Loading highlights...</Text>}
      {error && <Text color="fg.error">Error: {error.message}</Text>}

      <Stack gap="gap.lg">
        {groupedHighlights.map(group => (
          <Stack
            key={group.parent_root.id}
            gap="gap.sm"
            bg="bg.subtle"
            p="gap.lg"
            borderRadius="lg"
            {...getOutlineContrastStyle({ variant: "subtle" })}
          >
            <PostCard post={group.parent_root} />

            <Flex gap="gap.lg">
              <PostAuthor post={group.parent_root} />
              <NavLink
                to={urls.getPostUrls(group.parent_root).detail}
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
                  <FaComments /> <Text color="gray.400">{group.parent_root.comments_count}</Text>
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

                    {/* @ts-expect-error #bad-infer and #AI-slop graphql query that should use a shared Fragment */}
                    <PostContentHighlighted post={highlight.post} highlights={highlightsMap} />
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
const UserHighlightsQuery = graphql.persisted(
  "UserHighlights",
  graphql(
    `query UserHighlights {
      user_highlights {
        id
        text
        text_prefix
        text_postfix
        created_at
  
        post {
          ...CommentFieldsFragment
          parent_root {
            ...PostFragment
          }
        }
      }
    }`,
    [CommentFieldsFragment, PostFragment],
  ),
);
