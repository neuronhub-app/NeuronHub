import type { Post } from "@/apps/posts/list/PostList";
import { RatingBars } from "@/apps/reviews/PostReviewCard/RatingBars";
import { UsageStatusBlock } from "@/apps/reviews/PostReviewCard/UsageStatus";
import type { PostReview } from "@/apps/reviews/list/PostReviewList";
import { PostDatetime } from "@/components/posts/PostCard/PostDatetime";
import { Prose } from "@/components/ui/prose";
import { HStack, Heading, Show, Stack, Text } from "@chakra-ui/react";
import { marked } from "marked";
import { NavLink } from "react-router";

export function PostCard(props: { post: Post | PostReview }) {
  const post = props.post;

  const isPostReview = post.__typename === "PostReviewType";

  return (
    <Stack gap="gap.sm">
      <PostDatetime datetimeStr={isPostReview ? post.reviewed_at : post.updated_at} />

      {isPostReview && (
        <Heading fontSize="xl" lineHeight={1.4} fontWeight="normal">
          {post.tool.name}
        </Heading>
      )}

      {isPostReview && (
        <NavLink to={`/reviews/${post.id}`}>
          <Text fontWeight="bold" color="fg.muted">
            {post.title}
          </Text>
        </NavLink>
      )}

      {isPostReview && (
        <HStack gap="gap.lg">
          <RatingBars rating={post.rating} type="rating" color="fg.secondary" />
          <RatingBars rating={post.importance} type="importance" color="fg.secondary" />
          <RatingBars
            rating={post.experience_hours}
            type="experience"
            color="fg.secondary"
            boxSize={6}
          />
          <UsageStatusBlock status={post.usage_status} color="fg.secondary" />
        </HStack>
      )}

      <Show when={post.content}>
        <Prose
          // biome-ignore lint/security/noDangerouslySetInnerHtml:
          dangerouslySetInnerHTML={{
            __html: marked.parse(post.content),
          }}
          size="md"
        />
      </Show>
    </Stack>
  );
}
