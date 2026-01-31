import {
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  type JsxStyleProps,
  Link,
  Show,
  Skeleton,
  Stack,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import type { BaseHit, Hit } from "instantsearch.js";
import type { ReactElement } from "react";
import { FaHackerNewsSquare } from "react-icons/fa";
import {
  FaComment,
  FaGithub,
  FaPenToSquare,
} from "react-icons/fa6";
import { SiCrunchbase } from "react-icons/si";
import { TbTriangleFilled } from "react-icons/tb";
import { Highlight } from "react-instantsearch";
import { NavLink } from "react-router";

import { useUser } from "@/apps/users/useUserCurrent";
import type { PostListItemType } from "@/components/posts/ListContainer";
import { PostAuthor } from "@/components/posts/PostCard/PostAuthor";
import { PostButtons } from "@/components/posts/PostCard/PostButtons";
import { PostButtonsVote } from "@/components/posts/PostCard/PostButtonsVote";
import { PostContent } from "@/components/posts/PostCard/PostContent";
import { PostDatetime } from "@/components/posts/PostCard/PostDatetime";
import { PostTags } from "@/components/posts/PostCard/PostTags";
import { ReviewTagsWithVotes } from "@/components/posts/PostCard/ReviewTagsWithVotes";
import { RatingBars } from "@/components/posts/PostReviewCard/RatingBars";
import { ReviewTags } from "@/components/posts/PostReviewCard/ReviewTags";
import { UsageStatusBlock } from "@/components/posts/PostReviewCard/UsageStatus";
import { usePostVoting } from "@/components/posts/usePostVoting";
import { ids } from "@/e2e/ids";
import { isReview } from "@/graphql/fragments/reviews";
import { urls } from "@/urls";
import { getOutlineContrastStyle } from "@/utils/getOutlineContrastStyle";

const style = {
  color: {
    fg: {
      // top-down hierarchy:
      title: "fg",
      data: "fg.subtle",
      icon: { _dark: "gray.700", _light: "gray.300" }, // lower than fg.subtle
      help: "fg.subtle",
    } satisfies { [key: string]: JsxStyleProps["color"] },
  },
  gap: {
    icon: "gap.sm",
  } satisfies { [key: string]: JsxStyleProps["gap"] },
} as const;

export function PostCard(props: {
  post: PostListItemType;
  isPageListCompact?: boolean;
  isPageDetail?: boolean;
  urlNamespace: "reviews" | "posts" | "tools";
}) {
  const post = props.post;

  return (
    <HStack as="article" key={post?.id} gap="gap.md" align="flex-start">
      {!props.isPageListCompact && (
        <Stack>
          <PostButtonsVote post={post} />
          <PostButtons post={post} />
        </Stack>
      )}

      <Stack
        w="full"
        gap={props.isPageListCompact ? "2px" : "gap.md"}
        bg={props.isPageListCompact ? "" : "bg.light"}
        p={props.isPageListCompact ? "1" : "gap.md"}
        borderRadius={props.isPageListCompact ? 0 : "lg"}
        {...(props.isPageListCompact ? {} : getOutlineContrastStyle({ variant: "subtle" }))}
      >
        <Stack
          gap={props.isPageListCompact ? "gap.sm" : "gap.md"}
          {...ids.set(ids.post.card.container)}
          data-id={post.id}
        >
          <PostHeader
            post={post}
            isPageDetail={props.isPageDetail}
            isPageListCompact={props.isPageListCompact}
          />

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

          {!props.isPageListCompact && <PostContent post={post} />}

          {isReview(post) && post.tags.length > 0 && (
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
          )}
        </Stack>

        <HStack justify="space-between" align="flex-end">
          <HStack
            gap="gap.md2"
            align="center"
            separator={
              <Flex mx="gap.sm2" color="border">
                |
              </Flex>
            }
          >
            {props.isPageListCompact && <PostVotes post={post} />}
            {!props.isPageDetail && (
              <PostCommentsLink post={post} urlNamespace={props.urlNamespace} />
            )}

            {!isReview(post) && <PostDatetime datetimeStr={post.created_at} />}

            <PostAuthor
              post={post}
              color={style.color.fg.data}
              prefix="by"
              prefixColor={style.color.fg.help}
              prefixGap={style.gap.icon}
            />
          </HStack>

          {!props.isPageListCompact && (
            <Flex gap="gap.md" fontSize="sm">
              <PostSourceLinks post={post} />
            </Flex>
          )}
        </HStack>

        {!isReview(post) && post.tags.length > 0 && (
          <PostTags
            tags={post.tags}
            postId={post.id}
            isHideIcons={props.isPageListCompact}
            tagsNameExcluded={props.isPageListCompact ? ["HackerNews"] : []}
          />
        )}
      </Stack>
    </HStack>
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

function PostVotes(props: { post: PostListItemType }) {
  const voting = usePostVoting({
    postId: props.post.id,
    votes: props.post.votes,
    score_external: props.post.post_source?.score,
  });

  return (
    <HStack align="center" fontSize="sm" gap={style.gap.icon}>
      <IconButton
        loading={voting.isLoadingUpvote}
        onClick={() => voting.vote({ isPositive: true })}
        data-state={voting.isVotePositive ? "checked" : "unchecked"}
        variant="plain"
        borderRadius="lg"
        minW="0"
        size="2xs"
        _hover={{ color: "fg.primary-muted" }}
        {...ids.set(ids.post.vote.up)}
        aria-label="Upvote"
        color={voting.isVotePositive ? "fg.primary" : style.color.fg.icon}
      >
        {/*<FaCaretUp />*/}
        <Icon boxSize={3} mt="2px" transform="scaleX(0.9)">
          <TbTriangleFilled />
        </Icon>
      </IconButton>

      <Flex {...ids.set(ids.post.vote.count)} color={style.color.fg.data}>
        {voting.sum}
      </Flex>
    </HStack>
  );
}

function PostHeader(props: {
  post: PostListItemType;
  isPageDetail?: boolean;
  isPageListCompact?: boolean;
}) {
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

  const isAlgoliaSearchResult = "_highlightResult" in post;

  const sourceOfSource = post.post_source?.url_of_source;
  let sourceDomain = "";
  if (sourceOfSource) {
    const url = new URL(sourceOfSource);
    sourceDomain = url.hostname.replace("www.", "");
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

            <Flex align="center" gap="gap.md">
              <Heading
                fontSize={props.isPageDetail ? "xl" : "lg"}
                fontWeight={props.isPageListCompact ? "normal" : "semibold"}
                display="flex"
                gap="gap.sm"
                alignItems="center"
              >
                {isAlgoliaSearchResult ? (
                  <Highlight attribute="title" hit={post as unknown as Hit<BaseHit>} />
                ) : (
                  post.title || post.type
                )}
              </Heading>
            </Flex>
          </Stack>
        </PostHeaderLink>

        {props.isPageListCompact && sourceOfSource && (
          <Link
            href={sourceOfSource}
            color={style.color.fg.help}
            fontSize="sm"
            target="_blank"
            rel="nofollow"
          >
            {sourceDomain}
          </Link>
        )}
      </Flex>

      {isUserCanEdit() && !props.isPageListCompact && (
        <Flex gap="gap.sm" align="center">
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

function PostCommentsLink(props: {
  post: PostListItemType;
  urlNamespace: "reviews" | "posts" | "tools";
}) {
  const post = props.post;

  return (
    <NavLink to={`/${props.urlNamespace}/${post.id}`} style={{ width: "min-content" }}>
      <IconButton
        display="flex"
        variant="plain"
        colorPalette="gray"
        color={style.color.fg.icon}
        _hover={{ color: "gray.400" }}
        size="sm"
        h="min"
        gap={style.gap.icon}
        aria-label="Comments"
      >
        <Icon boxSize="13px" mb="-1px">
          {/*<BsChatSquareText />*/}
          {/*<FaRegComment />*/}
          <FaComment />
        </Icon>{" "}
        <Flex fontVariantNumeric="tabular-nums" fontSize="small" color={style.color.fg.data}>
          {post.comment_count}
        </Flex>
      </IconButton>
    </NavLink>
  );
}

function PostSourceLinks(props: { post: PostListItemType }) {
  const post = props.post;

  return (
    <>
      {post.source && (
        <Link href={post.source} color="fg.subtle" variant="underline">
          {post.source.includes("news.ycombinator.com") && <FaHackerNewsSquare />} Source
        </Link>
      )}

      {post.crunchbase_url && (
        <Link href={`https://${post.crunchbase_url}`} color="fg.subtle" variant="underline">
          <Icon>
            <SiCrunchbase />
          </Icon>
          Crunchbase
        </Link>
      )}

      {post.github_url && (
        <Link href={`https://${post.github_url}`} color="fg.subtle" variant="underline">
          <Icon>
            <FaGithub />
          </Icon>
          GitHub
        </Link>
      )}
    </>
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
