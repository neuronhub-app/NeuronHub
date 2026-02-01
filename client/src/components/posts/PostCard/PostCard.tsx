import {
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Image,
  Link,
  Show,
  Skeleton,
  Stack,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import type { ReactElement } from "react";
import { FaHackerNewsSquare } from "react-icons/fa";
import { FaGithub, FaPenToSquare } from "react-icons/fa6";
import { SiCrunchbase } from "react-icons/si";
import { NavLink } from "react-router";
import { useUser } from "@/apps/users/useUserCurrent";
import type { PostListItemType } from "@/components/posts/ListContainer";
import { PostAuthor } from "@/components/posts/PostCard/PostAuthor";
import { PostButtons } from "@/components/posts/PostCard/PostButtons";
import { PostButtonsVote } from "@/components/posts/PostCard/PostButtonsVote";
import { PostCommentsLink } from "@/components/posts/PostCard/PostCommentsLink";
import { PostContent } from "@/components/posts/PostCard/PostContent";
import { PostDatetime } from "@/components/posts/PostCard/PostDatetime";
import { PostTags } from "@/components/posts/PostCard/PostTags";
import { PostHeading } from "@/components/posts/PostCard/PostHeading";
import { ReviewTagsWithVotes } from "@/components/posts/PostCard/ReviewTagsWithVotes";
import { RatingBars } from "@/components/posts/PostReviewCard/RatingBars";
import { ReviewTags } from "@/components/posts/PostReviewCard/ReviewTags";
import { UsageStatusBlock } from "@/components/posts/PostReviewCard/UsageStatus";
import { ids } from "@/e2e/ids";
import { isReview } from "@/graphql/fragments/reviews";
import { urls } from "@/urls";
import { getOutlineBleedingProps } from "@/utils/getOutlineBleedingProps";

export function PostCard(props: {
  post: PostListItemType;
  isPageDetail?: boolean;
  urlNamespace: "reviews" | "posts" | "tools";
}) {
  const post = props.post;

  return (
    <HStack as="article" key={post.id} gap="gap.md" align="flex-start">
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
        {...getOutlineBleedingProps("muted")}
      >
        <Stack gap="gap.md" {...ids.set(ids.post.card.container)} data-id={post.id}>
          <PostHeader post={post} isPageDetail={props.isPageDetail} />

          {isReview(post) && (
            <Show
              when={
                post.review_usage_status ||
                post.review_rating ||
                post.review_importance ||
                post.review_experience_hours ||
                post.review_tags.length
              }
            >
              <VStack align="flex-start" gap="2">
                <HStack gap="gap.lg" px={0.5}>
                  <UsageStatusBlock status={post.review_usage_status} color="fg.secondary" />
                  <RatingBars rating={post.review_rating} type="rating" color="fg.secondary" />
                  <RatingBars
                    rating={post.review_importance}
                    type="importance"
                    color="fg.secondary"
                  />
                  <RatingBars
                    rating={post.review_experience_hours}
                    type="experience"
                    color="fg.secondary"
                    boxSize="22px"
                  />
                </HStack>

                {post.author && <ReviewTags tags={post.review_tags} authorId={post.author.id} />}
              </VStack>
            </Show>
          )}

          <PostContent post={post} />

          {post.tags.length > 0 && isReview(post) ? (
            <Stack gap="gap.sm">
              <Flex>
                <Wrap>
                  {post.author && (
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
              </Flex>
            </Stack>
          ) : (
            <PostTags tags={post.tags} postId={post.id} />
          )}
        </Stack>

        <HStack justify="space-between" align="flex-end">
          <HStack gap="gap.md" align="center">
            {!props.isPageDetail && (
              <PostCommentsLink
                url={`/${props.urlNamespace}/${post.id}`}
                count={post.comment_count}
              />
            )}
            {!isReview(post) && <PostDatetime datetimeStr={post.created_at} />}
            <PostAuthor post={post} color="fg.subtle" prefix="by" prefixColor="fg.subtle" />
          </HStack>

          <Flex gap="gap.md" fontSize="sm">
            <PostSourceLinks post={post} />
          </Flex>
        </HStack>
      </Stack>
    </HStack>
  );
}

function PostHeader(props: { post: PostListItemType; isPageDetail?: boolean }) {
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

  return (
    <HStack align="flex-start" justify="space-between" mb={-1.5}>
      <Flex gap="gap.md" align="center">
        <PostHeaderLink post={post} isDetailPage={props.isPageDetail}>
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

            <PostHeading post={post} fontSize={props.isPageDetail ? "xl" : "lg"} />
          </Stack>
        </PostHeaderLink>
      </Flex>

      {isUserCanEdit() && (
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
      )}
    </HStack>
  );
}

function PostHeaderLink(props: {
  post: PostListItemType;
  isDetailPage?: boolean;
  children: ReactElement;
}) {
  if (props.isDetailPage) {
    return <Flex>{props.children}</Flex>;
  }

  return (
    <NavLink to={urls.getPostUrls(props.post).detail} {...ids.set(ids.post.card.link.detail)}>
      <Flex _hover={{ color: "fg.primary-muted" }} transition="colors" transitionDuration="fast">
        {props.children}
      </Flex>
    </NavLink>
  );
}

function PostSourceLinks(props: { post: PostListItemType }) {
  return (
    <>
      {props.post.source && (
        <Link href={props.post.source} color="fg.subtle" variant="underline">
          {props.post.source.includes("news.ycombinator.com") && <FaHackerNewsSquare />} Source
        </Link>
      )}

      {props.post.crunchbase_url && (
        <Link
          href={`https://${props.post.crunchbase_url}`}
          color="fg.subtle"
          variant="underline"
        >
          <Icon>
            <SiCrunchbase />
          </Icon>
          Crunchbase
        </Link>
      )}

      {props.post.github_url && (
        <Link href={`https://${props.post.github_url}`} color="fg.subtle" variant="underline">
          <Icon>
            <FaGithub />
          </Icon>
          GitHub
        </Link>
      )}
    </>
  );
}

export function PostCardSkeleton() {
  return (
    <Flex gap="gap.md" direction="row">
      <Skeleton w="9" h="40" />
      <Skeleton w="full" h="56" flexShrink="initial" />
    </Flex>
  );
}
