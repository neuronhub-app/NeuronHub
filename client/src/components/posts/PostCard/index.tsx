import { Heading, HStack, Show, Stack, Text } from "@chakra-ui/react";
import { marked } from "marked";
import { NavLink } from "react-router";
import { RatingBars } from "@/apps/reviews/PostReviewCard/RatingBars";
import { UsageStatusBlock } from "@/apps/reviews/PostReviewCard/UsageStatus";
import type { PostListItemType } from "@/components/posts/ListContainer";
import { PostDatetime } from "@/components/posts/PostCard/PostDatetime";
import { Prose } from "@/components/ui/prose";
import { isPostReviewType } from "@/graphql/fragments/reviews";

// todo refac: has too many isPostReviewType() → must
export function PostCard(props: { post: PostListItemType }) {
  const post = props.post;

  return (
    <Stack gap="gap.sm" data-testid="post-card">
      <PostDatetime datetimeStr={isPostReviewType(post) ? post.reviewed_at : post.updated_at} />
      <Text data-testid="post-type" display="none">
        {isPostReviewType(post) ? "Review" : "Post"}
      </Text>

      {isPostReviewType(post) && post.parent && (
        <Heading fontSize="xl" lineHeight={1.4} fontWeight="normal">
          {post.parent.title}
        </Heading>
      )}

      <NavLink to={isPostReviewType(post) ? `/reviews/${post.id}` : `/posts/${post.id}`}>
        <Text fontWeight="bold" color="fg.muted">
          {post.title}
        </Text>
      </NavLink>

      {isPostReviewType(post) && (
        <HStack gap="gap.lg">
          <UsageStatusBlock status={post.review_usage_status} color="fg.secondary" />
          <RatingBars rating={post.review_rating} type="rating" color="fg.secondary" />
          <RatingBars rating={post.review_importance} type="importance" color="fg.secondary" />
          <RatingBars
            rating={post.review_experience_hours}
            type="experience"
            color="fg.secondary"
            boxSize={6}
          />
        </HStack>
      )}

      <Show when={post.content}>
        <Prose
          // biome-ignore lint/security/noDangerouslySetInnerHtml: it's cleaned by server
          dangerouslySetInnerHTML={{ __html: marked.parse(post.content) }}
          size="md"
        />
      </Show>
    </Stack>
  );
}
