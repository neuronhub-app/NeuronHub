import {
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Image,
  Link,
  Stack,
  Text,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import type { ReactElement } from "react";
import { FaComments, FaHackerNewsSquare } from "react-icons/fa";
import { FaGithub, FaPenToSquare } from "react-icons/fa6";
import { SiCrunchbase } from "react-icons/si";
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
import { PostReimportButton } from "@/components/posts/PostDetail/PostReimportButton";
import { RatingBars } from "@/components/posts/PostReviewCard/RatingBars";
import { ReviewTags } from "@/components/posts/PostReviewCard/ReviewTags";
import { UsageStatusBlock } from "@/components/posts/PostReviewCard/UsageStatus";
import { ids } from "@/e2e/ids";
import { isReview } from "@/graphql/fragments/reviews";
import { urls } from "@/urls";
import { getOutlineContrastStyle } from "@/utils/getOutlineContrastStyle";

// todo refac-name: file to PostCard.tsx
export function PostCard(props: {
  post: PostListItemType;
  isDetailPage?: boolean;
  urlNamespace: "reviews" | "posts" | "tools";
}) {
  const post = props.post;

  return (
    <HStack as="article" key={post?.id} gap="gap.md" align="flex-start">
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
        {...getOutlineContrastStyle({ variant: "subtle" })}
      >
        <Stack gap="gap.sm" {...ids.set(ids.post.card.container)} data-id={post.id}>
          <PostHeader post={post} isDetailPage={props.isDetailPage} />

          {isReview(post) && (
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
          )}

          <PostContent post={post} />

          {Boolean(post.tags.length) && <PostTagsSection post={post} />}
        </Stack>

        <HStack justify="space-between" align="flex-end">
          <Flex gap="gap.lg">
            <PostAuthor post={post} />

            {!props.isDetailPage && (
              <PostCommentsLink post={post} urlNamespace={props.urlNamespace} />
            )}
          </Flex>

          <Flex gap="gap.md" fontSize="sm">
            <PostSourceLinks post={post} />
          </Flex>
        </HStack>
      </Stack>
    </HStack>
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
            {!isReview(post) && <PostDatetime datetimeStr={post.created_at} />}
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

function PostTagsSection(props: { post: PostListItemType }) {
  const post = props.post;
  return (
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
        variant="plain"
        colorPalette="gray"
        aria-label="Comments"
        color="gray.300"
        _hover={{ color: "slate.400" }}
        size="sm"
        h="auto"
      >
        <FaComments /> <Text color="gray.400">{post.comment_count}</Text>
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
