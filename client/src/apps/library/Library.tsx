import { Box, Heading, Stack, Text } from "@chakra-ui/react";
import { useMemo } from "react";
import { PostContentHighlighted } from "@/apps/highlighter/PostContentHighlighted";
import { useHighlighter } from "@/apps/highlighter/useHighlighter";
import { PostCard } from "@/components/posts/PostCard";
import { graphql, type ID, type ResultOf } from "@/gql-tada";
import {
  CommentFieldsFragment,
  PostCommentsFragment,
  PostFragment,
} from "@/graphql/fragments/posts";
import { useApolloQuery } from "@/graphql/useApolloQuery";
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

      <Stack gap="gap.2xl">
        {groupedHighlights.map(group => (
          <Stack
            key={group.root_post.id}
            gap="gap.lg"
            bg="bg.subtle"
            p="gap.lg"
            borderRadius="lg"
            {...getOutlineContrastStyle({ variant: "subtle" })}
          >
            {/* Show the root post */}
            <Stack gap="gap.sm">
              <Text fontSize="xs" color="fg.muted" fontWeight="medium">
                From Post
              </Text>
              <PostCard post={group.root_post} />
            </Stack>

            <Stack aria-label="author & date" gap="gap.md">
              {group.highlights.map(highlight => (
                <Stack gap="gap.sm" key={highlight.id}>
                  <Text fontSize="xs" color="fg.muted" fontWeight="medium">
                    Highlighted Comment
                  </Text>

                  <Box
                    bg="bg.panel"
                    p="gap.md"
                    borderRadius="md"
                    borderLeftWidth="3px"
                    borderColor="colorPalette.solid"
                  >
                    <Stack aria-label="author & date" gap="gap.xs" mb="gap.sm">
                      <Text fontSize="xs" color="fg.muted">
                        Comment by{" "}
                        {/* todo the date format is shit, we need to use client/src/utils/date-fns.ts */}
                        {highlight.post.source_author ||
                          highlight.post.author?.username ||
                          "Anonymous"}
                        {" · "}
                        {new Date(
                          highlight.post.posts_source?.[0]?.created_at_external ||
                            highlight.post.created_at,
                        ).toLocaleDateString()}
                      </Text>
                      <Text fontSize="xs" color="fg.subtle">
                        Highlighted on {new Date(highlight.created_at).toLocaleDateString()}
                      </Text>
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
