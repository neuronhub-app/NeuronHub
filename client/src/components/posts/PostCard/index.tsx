import {
  Flex,
  Heading,
  HStack,
  IconButton,
  Image,
  Show,
  Stack,
  Text,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import { marked } from "marked";
import { FaPenToSquare } from "react-icons/fa6";
import { NavLink } from "react-router";
import { useUser } from "@/apps/users/useUserCurrent";
import type { PostListItemType } from "@/components/posts/ListContainer";
import { PostDatetime } from "@/components/posts/PostCard/PostDatetime";
import { PostTags } from "@/components/posts/PostCard/PostTags";
import { ReviewTagsWithVotes } from "@/components/posts/PostCard/ReviewTagsWithVotes";
import { RatingBars } from "@/components/posts/PostReviewCard/RatingBars";
import { ReviewTags } from "@/components/posts/PostReviewCard/ReviewTags";
import { UsageStatusBlock } from "@/components/posts/PostReviewCard/UsageStatus";
import { Prose } from "@/components/ui/prose";
import { ids } from "@/e2e/ids";
import { isReview } from "@/graphql/fragments/reviews";
import { urls } from "@/routes";

// todo refac: too many isReview() → must be another comp
export function PostCard(props: { post: PostListItemType }) {
  const user = useUser();

  const post = props.post;

  return (
    <Stack gap="gap.sm" {...ids.set(ids.post.card.container)} data-id={post.id}>
      <HStack justify="space-between" align="center">
        <PostDatetime datetimeStr={isReview(post) ? post.reviewed_at : post.updated_at} />
        {user?.id === props.post.author?.id && (
          <IconButton
            asChild
            variant="subtle-ghost"
            size="2xs"
            p={1}
            h="auto"
            aria-label="edit"
            {...ids.set(ids.post.card.link.edit)}
          >
            <NavLink
              to={
                isReview(props.post)
                  ? urls.reviews.edit(props.post.id)
                  : urls.posts.edit(props.post.id)
              }
            >
              <FaPenToSquare />
            </NavLink>
          </IconButton>
        )}
      </HStack>

      <NavLink
        to={isReview(post) ? urls.reviews.detail(post.id) : urls.posts.detail(post.id)}
        {...ids.set(ids.post.card.link.detail)}
      >
        <Stack gap="gap.sm">
          {isReview(post) && post.parent && (
            <Heading fontSize="xl" lineHeight={1.4} fontWeight="normal">
              {post.parent.title}
            </Heading>
          )}
          {post.image && (
            <Image
              src={post.image.url}
              maxH="200px"
              objectFit="cover"
              borderRadius="md"
              {...ids.set(ids.post.card.image)}
            />
          )}
          <Text fontWeight="bold" color="fg.muted">
            {post.title}
          </Text>
        </Stack>
      </NavLink>

      {isReview(post) && (
        <VStack align="flex-start" gap="2">
          <HStack gap="gap.lg" px={0.5}>
            <UsageStatusBlock status={post.review_usage_status} color="fg.secondary" />
            <RatingBars rating={post.review_rating} type="rating" color="fg.secondary" />
            <RatingBars rating={post.review_importance} type="importance" color="fg.secondary" />
            <RatingBars
              rating={post.review_experience_hours}
              type="experience"
              color="fg.secondary"
              boxSize="22px"
            />
          </HStack>
          <ReviewTags tags={post.review_tags} authorId={post.author.id} />
        </VStack>
      )}

      <Show when={post.content}>
        <Prose
          // biome-ignore lint/security/noDangerouslySetInnerHtml: cleaned by server
          dangerouslySetInnerHTML={{ __html: marked.parse(post.content) }}
          size="md"
        />
      </Show>

      <Stack mt="gap.sm" gap="gap.sm">
        <Flex>
          {isReview(post) ? (
            <Wrap>
              {post.tags.length !== 0 && (
                <ReviewTagsWithVotes
                  tags={post.tags}
                  authorId={post.author.id}
                  reviewId={post.id}
                />
              )}

              <PostTags
                tags={post.parent.tags}
                tagsExcluded={post.tags.map(tag => tag.id)}
                postId={post.parent.id}
                isWrapChildren={false}
              />
            </Wrap>
          ) : (
            <PostTags tags={post.tags} postId={post.id} />
          )}
        </Flex>
      </Stack>
    </Stack>
  );
}
