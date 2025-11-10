import {
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Stack,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import type { ReactElement } from "react";
import { FaPenToSquare } from "react-icons/fa6";
import { NavLink } from "react-router";
import { useUser } from "@/apps/users/useUserCurrent";
import type { PostListItemType } from "@/components/posts/ListContainer";
import { PostContent } from "@/components/posts/PostCard/PostContent";
import { PostDatetime } from "@/components/posts/PostCard/PostDatetime";
import { PostTags } from "@/components/posts/PostCard/PostTags";
import { ReviewTagsWithVotes } from "@/components/posts/PostCard/ReviewTagsWithVotes";
import { PostReimportButton } from "@/components/posts/PostDetail/PostReimportButton";
import { RatingBars } from "@/components/posts/PostReviewCard/RatingBars";
import { ReviewTags } from "@/components/posts/PostReviewCard/ReviewTags";
import { UsageStatusBlock } from "@/components/posts/PostReviewCard/UsageStatus";
import { ids } from "@/e2e/ids";
import { isReview } from "@/graphql/fragments/reviews";
import { urls } from "@/urls";

// todo refac-name: file to PostCard.tsx
export function PostCard(props: { post: PostListItemType; isDetailPage?: boolean }) {
  const post = props.post;

  return (
    <Stack gap="gap.sm" {...ids.set(ids.post.card.container)} data-id={post.id}>
      <PostHeader post={post} isDetailPage={props.isDetailPage} />

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
                {post.tags.length > 0 && post.author && (
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

function PostHeader(props: { post: PostListItemType; isDetailPage?: boolean }) {
  const user = useUser();

  const post = props.post;

  function isUserCanEdit() {
    if (!user?.id) {
      return false;
    }
    const isAuthor = user.id === post.author?.id;
    const isPostImported = post.author === null;
    return isAuthor || (isPostImported && user.is_superuser);
  }

  const idExternal = props.post?.post_source?.id_external;

  return (
    <HStack align="flex-start" justify="space-between">
      <PostHeaderLink post={post} isDetailPage={props.isDetailPage}>
        <Stack gap="gap.sm">
          {isReview(post) && post.parent && (
            <Flex align="center" gap="gap.md">
              <Heading fontSize="xl" lineHeight={1.4} fontWeight="normal">
                {post.parent.title}
              </Heading>
              <PostDatetime datetimeStr={post.reviewed_at} />
            </Flex>
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

          <Flex align="center" gap="gap.md">
            <Heading
              fontSize={props.isDetailPage ? "xl" : "lg"}
              display="flex"
              gap="gap.sm"
              alignItems="center"
            >
              {/* todo UX: show .parent_root.title */}
              {post.title ? post.title : `${post.type}`}
            </Heading>
            {!isReview(post) && <PostDatetime datetimeStr={post.updated_at} />}
          </Flex>
        </Stack>
      </PostHeaderLink>

      {isUserCanEdit() && (
        <Flex gap="gap.sm" align="center">
          {idExternal && <PostReimportButton idExternal={idExternal} />}

          <NavLink to={urls.getPostUrls(post).edit}>
            <Button
              variant="subtle-ghost-v2"
              size="2xs"
              h="auto"
              gap="gap.sm"
              {...ids.set(ids.post.card.link.edit)}
            >
              <Icon boxSize={3} mb="1px">
                <FaPenToSquare />
              </Icon>
              Edit
            </Button>
          </NavLink>
        </Flex>
      )}
    </HStack>
  );
}

function PostHeaderLink(props: {
  post: PostListItemType;
  isDetailPage?: boolean;
  children: ReactElement;
}) {
  return (
    <>
      {props.isDetailPage ? (
        <Flex>{props.children}</Flex>
      ) : (
        <NavLink
          to={urls.getPostUrls(props.post).detail}
          {...ids.set(ids.post.card.link.detail)}
        >
          <Flex
            _hover={{ color: "fg.primary-muted" }}
            transition="colors"
            transitionDuration="fast"
          >
            {props.children}
          </Flex>
        </NavLink>
      )}
    </>
  );
}
