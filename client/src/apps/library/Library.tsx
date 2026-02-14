import { Box, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import { type ComponentProps, useMemo } from "react";
import { PostContentHighlighted } from "@/apps/highlighter/PostContentHighlighted";
import { highlightsMap } from "@/apps/highlighter/useHighlighter";
import { PostCard } from "@/components/posts/PostCard/PostCard";
import { PostDatetime } from "@/components/posts/PostCard/PostDatetime";
import { graphql, type ID, type ResultOf } from "@/gql-tada";
import { CommentFieldsFragment, isTool, PostFragment } from "@/graphql/fragments/posts";
import { isReview } from "@/graphql/fragments/reviews";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { getOutlineBleedingProps } from "@/utils/getOutlineBleedingProps";
import { useInit } from "@/utils/useInit";

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

  const initHighlights = useInit({
    isReady: Boolean(data?.user_highlights?.length),
    dependencies: [data?.user_highlights],
    onInit: () => {
      const mapNew = new Map<ID, UserPostHighlight[]>();

      for (const highlight of data!.user_highlights) {
        mapNew.set(highlight.post.id, []);
      }
      for (const highlight of data!.user_highlights) {
        mapNew.get(highlight.post.id)!.push(highlight);
      }

      for (const [postId, userHighlights] of mapNew) {
        highlightsMap.set(
          postId,
          userHighlights.map(h => ({
            id: h.id,
            text: h.text,
            text_prefix: h.text_prefix,
            text_postfix: h.text_postfix,
            post: { id: postId },
          })),
        );
      }
    },
  });

  function getPostNamespace(
    post: HighlightGroup["parent_root"],
  ): ComponentProps<typeof PostCard>["urlNamespace"] {
    if (isReview(post)) {
      return "reviews";
    }
    if (isTool(post)) {
      return "tools";
    }
    return "posts";
  }

  return (
    <Stack gap="gap.lg">
      <Heading size="2xl">Library</Heading>

      {initHighlights.isLoading && <Text>Loading highlights...</Text>}
      {error && <Text color="fg.error">Error: {error.message}</Text>}

      <Stack gap="gap.lg">
        {groupedHighlights.map(group => (
          <Stack
            key={group.parent_root.id}
            gap="gap.md"
            bg="bg.panel"
            p="gap.lg"
            borderRadius="lg"
            {...getOutlineBleedingProps("muted")}
          >
            <PostCard
              post={group.parent_root}
              urlNamespace={getPostNamespace(group.parent_root)}
            />

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
                          {highlight.post.post_source?.user_source?.username ??
                            highlight.post.author?.username}
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

                    <PostContentHighlighted post={highlight.post} />
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

type UserPostHighlightsRes = ResultOf<typeof UserHighlightsQuery>;
type UserPostHighlight = NonNullable<UserPostHighlightsRes["user_highlights"]>[number];
