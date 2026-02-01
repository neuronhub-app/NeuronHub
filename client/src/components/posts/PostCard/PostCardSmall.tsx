import {
  Flex,
  HStack,
  Icon,
  IconButton,
  type JsxStyleProps,
  Link,
  Stack,
} from "@chakra-ui/react";
import { TbTriangleFilled } from "react-icons/tb";
import { NavLink } from "react-router";

import type { PostListItemType } from "@/components/posts/ListContainer";
import { PostAuthor } from "@/components/posts/PostCard/PostAuthor";
import { PostCommentsLink } from "@/components/posts/PostCard/PostCommentsLink";
import { PostDatetime } from "@/components/posts/PostCard/PostDatetime";
import { PostHeading } from "@/components/posts/PostCard/PostHeading";
import { PostTags } from "@/components/posts/PostCard/PostTags";
import { usePostVoting } from "@/components/posts/usePostVoting";
import { ids } from "@/e2e/ids";
import { urls } from "@/urls";

export function PostCardSmall(props: {
  post: PostListItemType;
  urlNamespace: "reviews" | "posts" | "tools";
}) {
  const post = props.post;

  const voting = usePostVoting({
    postId: post.id,
    votes: post.votes,
    score_external: post.post_source?.score,
  });

  const sourceUrl = post.post_source?.url_of_source;
  let sourceUrlDomain = "";
  if (sourceUrl) {
    const url = new URL(sourceUrl);

    // todo ? UI: render GitHub {namespace}/{project} & reddit /r/{reddit}
    sourceUrlDomain = url.hostname.replace("www.", "");
  }

  return (
    <HStack as="article" key={post.id} gap="2.5" align="flex-start">
      <Stack w="full" gap="3px">
        <Stack gap="gap.sm" {...ids.set(ids.post.card.container)} data-id={post.id}>
          <HStack align="flex-start" justify="space-between" mb={-1.5}>
            <Flex gap="gap.md" align="center">
              <NavLink
                to={urls.getPostUrls(post).detail}
                {...ids.set(ids.post.card.link.detail)}
              >
                <Flex
                  align="center"
                  gap="gap.md"
                  _hover={{ color: "fg.primary-muted" }}
                  transition="colors"
                  transitionDuration="fast"
                >
                  <PostHeading post={post} fontWeight="normal" />
                </Flex>
              </NavLink>

              {sourceUrl && (
                <Link
                  href={sourceUrl}
                  color={style.color.help}
                  fontSize={style.fontSize.help}
                  target="_blank"
                  rel="nofollow"
                  transitionProperty="color"
                  transitionDuration="fast"
                  _hover={{ color: "fg" }}
                >
                  {sourceUrlDomain}
                </Link>
              )}
            </Flex>
          </HStack>
        </Stack>

        <HStack
          gap="gap.md2"
          align="center"
          separator={
            <Flex mx="gap.sm2" color="border">
              |
            </Flex>
          }
        >
          <HStack align="center" gap={style.gap.icon}>
            <IconButton
              loading={voting.isLoadingUpvote}
              onClick={() => voting.vote({ isPositive: true })}
              data-state={voting.isVotePositive ? "checked" : "unchecked"}
              variant="plain"
              minW="0"
              size="2xs"
              _hover={{ color: "fg.primary-muted" }}
              aria-label="Upvote"
              color={voting.isVotePositive ? "fg.primary" : style.color.icon}
              {...ids.set(ids.post.vote.up)}
            >
              <Icon boxSize={3} mt="2px" transform="scaleX(0.9)">
                <TbTriangleFilled />
              </Icon>
            </IconButton>

            <Flex
              {...ids.set(ids.post.vote.count)}
              color={style.color.data}
              fontSize={style.fontSize.data}
            >
              {voting.sum}
            </Flex>
          </HStack>

          <PostCommentsLink
            url={`/${props.urlNamespace}/${post.id}`}
            count={post.comment_count}
            iconColor={style.color.icon}
            textColor={style.color.data}
            fontSize={style.fontSize.data}
            gap={style.gap.icon}
          />

          <PostDatetime datetimeStr={post.created_at} size="xs" />

          <PostAuthor
            post={post}
            color={style.color.data}
            size="xs"
            prefix="by"
            prefixColor={style.color.help}
            prefixGap={style.gap.icon}
          />
        </HStack>

        {post.tags.length > 0 && (
          <PostTags
            tags={post.tags}
            postId={post.id}
            isHideIcons={true}
            tagsNameExcluded={["HackerNews"]}
          />
        )}
      </Stack>
    </HStack>
  );
}

const style = {
  color: {
    // top-down hierarchy:
    data: "fg.subtle",
    icon: { _dark: "gray.700", _light: "gray.300" }, // lower than fg.subtle
    help: "fg.subtle",
  } satisfies { [key: string]: JsxStyleProps["color"] },
  gap: {
    icon: "1" satisfies JsxStyleProps["gap"],
  },
  fontSize: {
    data: "xs",
    help: "sm",
  } satisfies { [key: string]: JsxStyleProps["fontSize"] },
} as const;
