import { Flex, Heading, HStack, IconButton, Image, Stack, VStack, Wrap } from "@chakra-ui/react";
import { FaHackerNewsSquare } from "react-icons/fa";
import { FaPenToSquare } from "react-icons/fa6";
import { NavLink } from "react-router";

import { useUser } from "@/apps/users/useUserCurrent";
import type { PostListItemType } from "@/components/posts/ListContainer";
import { PostContent } from "@/components/posts/PostCard/PostContent";
import { PostDatetime } from "@/components/posts/PostCard/PostDatetime";
import { PostTags } from "@/components/posts/PostCard/PostTags";
import { ReviewTagsWithVotes } from "@/components/posts/PostCard/ReviewTagsWithVotes";
import { RatingBars } from "@/components/posts/PostReviewCard/RatingBars";
import { ReviewTags } from "@/components/posts/PostReviewCard/ReviewTags";
import { UsageStatusBlock } from "@/components/posts/PostReviewCard/UsageStatus";
import { ids } from "@/e2e/ids";
import { isReview } from "@/graphql/fragments/reviews";
import { urls } from "@/routes";

export function PostCard(props: { post: PostListItemType }) {
  const user = useUser();

  const post = props.post;

  const postUrl = urls.getPostUrls(post).detail;

  return (
    <Stack gap="gap.sm" {...ids.set(ids.post.card.container)} data-id={post.id}>
      <HStack align="center" justify="space-between">
        <NavLink to={postUrl} {...ids.set(ids.post.card.link.detail)}>
          <HStack>
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
              <Heading
                fontSize="lg"
                color="fg.muted"
                display="flex"
                gap="gap.sm"
                alignItems="center"
              >
                {post.source.includes("news.ycombinator.com") && <FaHackerNewsSquare />}{" "}
                {/* todo UX: show .parent_root.title */}
                {post.title ? post.title : `${post.type}`}
              </Heading>
            </Stack>
            <PostDatetime datetimeStr={isReview(post) ? post.reviewed_at : post.updated_at} />
          </HStack>
        </NavLink>

        {user?.id === post.author?.id && (
          <IconButton
            asChild
            variant="subtle-ghost"
            size="2xs"
            p={1}
            h="auto"
            aria-label="edit"
            {...ids.set(ids.post.card.link.edit)}
          >
            <NavLink to={urls.getPostUrls(post).edit}>
              <FaPenToSquare />
            </NavLink>
          </IconButton>
        )}
      </HStack>

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

          {post.author && <ReviewTags tags={post.review_tags} authorId={post.author.id} />}
        </VStack>
      )}

      <PostContent post={post} />

      {Boolean(post.tags.length) && (
        <Stack mt="gap.sm" gap="gap.sm">
          <Flex>
            {isReview(post) ? (
              <Wrap>
                {post.tags.length !== 0 && post.author && (
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
                  isRenderInline={false}
                />
              </Wrap>
            ) : (
              <PostTags tags={post.tags} postId={post.id} />
            )}
          </Flex>
        </Stack>
      )}
    </Stack>
  );
}
