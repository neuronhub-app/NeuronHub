import {
  Avatar,
  Button,
  Flex,
  FormatNumber,
  HStack,
  type JsxStyleProps,
  Popover,
  Portal,
  SkeletonText,
  Text,
  VStack,
} from "@chakra-ui/react";
import { type ComponentProps, useMemo } from "react";
import { useSnapshot } from "valtio/react";

import { Prose } from "@neuronhub/shared/components/ui/prose";
import { datetime } from "@neuronhub/shared/utils/date-fns";
import { markedConfigured } from "@neuronhub/shared/utils/marked-configured";
import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";

import { user, UserQueryDoc } from "@/apps/users/useUserCurrent";
import type { PostListItemType } from "@/components/posts/ListContainer";
import type { PostCommentTree } from "@/components/posts/PostDetail/useCommentTree";
import { graphql } from "@/gql-tada";
import { client } from "@/graphql/client";
import { PostAuthorFragment, type PostAuthorFragmentType } from "@/graphql/fragments/posts";
import { toast } from "@/utils/toast";
import { useInit } from "@/utils/useInit";
import { useIsLoading } from "@/utils/useIsLoading";

// todo ? refac-name: indicate it can load UserSource profile, eg as `PostAuthor{Clickable|Popover}`
export function PostAuthor(props: {
  post: PostListItemType | PostCommentTree;
  isRenderAvatar?: boolean;
  color?: JsxStyleProps["color"];
  size?: "xs" | "sm";
  prefix?: "avatar" | "by";
  prefixColor?: JsxStyleProps["color"];
  prefixGap?: JsxStyleProps["gap"];
}) {
  const loadingFollow = useIsLoading();

  const state = useStateValtio({
    post: null as null | PostAuthorFragmentType, // todo ! refac-name: postSource
    isClicked: false,
    isMouseHoveredAndMustMount: false,
  });

  const isImportedAuthor = Boolean(props.post.post_source?.id);

  const userSnap = useSnapshot(user.state);

  const authorId = props.post.post_source?.user_source?.id;
  const isFollowed = Boolean(authorId) && userSnap.followedImporterUserSourceIds.has(authorId!);

  const init = useInit({
    isReady: isImportedAuthor && !state.snap.post && state.snap.isClicked,
    onInit: async () => {
      const res = await client.query({
        query: PostAuthorQuery,
        variables: { id: props.post.id },
      });
      if (res.data) {
        state.mutable.post = res.data.post_generic;
      } else {
        toast.error("Author loading failed");
      }
    },
  });

  async function handleFollowClick() {
    if (!authorId) return;

    await loadingFollow.track(async () => {
      const res = await client.mutate({
        mutation: ToggleFollowUserSourceMutation,
        variables: { user_source_id: authorId },
        refetchQueries: [UserQueryDoc],
      });

      if (res.error) {
        toast.error("Failed to update");
      }
    });
  }

  if (isImportedAuthor) {
    if (!state.snap.isMouseHoveredAndMustMount) {
      return (
        <Flex
          onMouseEnter={() => {
            state.mutable.isMouseHoveredAndMustMount = true;
          }}
        >
          <PostAuthorUsername {...props} isPopover isFollowed={isFollowed} />
        </Flex>
      );
    }

    const author = state.snap.post?.post_source?.user_source;

    return (
      <Popover.Root
        unmountOnExit
        onOpenChange={_ => {
          state.mutable.isClicked = true;
        }}
      >
        <Popover.Trigger>
          <PostAuthorUsername {...props} isPopover isFollowed={isFollowed} />
        </Popover.Trigger>

        <Portal>
          <Popover.Positioner>
            <Popover.Content minWidth="fit-content">
              <Popover.Arrow />
              <Popover.Body gap="gap.sm" display="flex" flexDirection="column" maxW="345px">
                {init.isLoading ? (
                  <>
                    <Flex>
                      <SkeletonText noOfLines={1} />
                    </Flex>
                    <Flex>
                      <SkeletonText noOfLines={1} />
                    </Flex>
                  </>
                ) : (
                  author && (
                    <>
                      <HStack gap="gap.md">
                        <VStack gap="gap.sm" alignItems="left" flexGrow="1">
                          <HStack whiteSpace="nowrap">
                            <Text fontWeight="bold">Created:</Text>
                            {datetime.relative(author.created_at_external)}
                          </HStack>
                          <HStack>
                            <Text fontWeight="bold">Karma:</Text>
                            <FormatNumber value={author.score} />
                          </HStack>
                        </VStack>

                        <VStack gap="gap.sm">
                          <Button
                            size="sm"
                            minW="24"
                            variant="outline"
                            loading={loadingFollow.isActive}
                            onClick={handleFollowClick}
                          >
                            {isFollowed ? "Unfollow" : "Follow"}
                          </Button>
                        </VStack>
                      </HStack>
                      {author.about && (
                        <Prose
                          size="xs"
                          dangerouslySetInnerHTML={{
                            __html: markedConfigured.parse(author.about),
                          }}
                        />
                      )}
                    </>
                  )
                )}
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    );
  }
  return <PostAuthorUsername {...props} />;
}

// todo ? refac: drop isPopover - only tell it "you're a link" to add _hover={}
function PostAuthorUsername(
  props: ComponentProps<typeof PostAuthor> & { isPopover?: boolean; isFollowed?: boolean },
) {
  const username = props.post.author?.username ?? props.post.post_source?.user_source?.username;

  const colorPalette = useMemo(() => {
    return getAvatarColorForUsername(username);
  }, [username]);

  return (
    <Flex align="center" gap={props.prefixGap ?? "gap.sm"}>
      {props.isRenderAvatar && (
        <Avatar.Root
          size="2xs"
          variant="subtle"
          colorPalette={colorPalette}
          _hover={props.isPopover ? { cursor: "pointer" } : {}}
        >
          <Avatar.Fallback name={username} />
          <Avatar.Image
            src={props.post.author?.avatar?.url}
            filter="grayscale(0.4)"
            _hover={{
              filter: "grayscale(0)",
            }}
          />
        </Avatar.Root>
      )}
      {props.prefix === "by" && (
        <Text fontSize={props.size ?? "sm"} color={props.prefixColor}>
          by
        </Text>
      )}

      <Text
        fontSize={props.size ?? "sm"}
        fontWeight={props.isFollowed ? "bold" : "semibold"}
        color={props.color ?? (props.isFollowed ? "sky.600" : "fg.subtle")}
        transitionProperty="color, font-weight"
        transitionDuration="fast"
        _hover={props.isPopover ? { textDecoration: "underline", cursor: "pointer" } : {}}
      >
        {username}
      </Text>
    </Flex>
  );
}

export function getAvatarColorForUsername(username?: string) {
  const colorPalette = [
    "blue",
    "gray",
    "slate",
    "red",
    "pink",
    "purple",
    "sky",
    "cyan",
    "teal",
    "green",
    "yellow",
    "orange",
  ];
  if (!username) {
    return colorPalette[0];
  }

  const index = (username.charCodeAt(0) + username.charCodeAt(1)) % colorPalette.length;
  return colorPalette[index];
}

const PostAuthorQuery = graphql.persisted(
  "PostAuthor",
  graphql(
    `
      query PostAuthor($id: ID!) {
        post_generic(pk: $id) {
          id
          ...PostAuthorFragment
        }
      }
    `,
    [PostAuthorFragment],
  ),
);

const ToggleFollowUserSourceMutation = graphql.persisted(
  "ToggleFollowUserSource",
  graphql(`
    mutation ToggleFollowUserSource($user_source_id: ID!) {
      toggle_follow_user_source(user_source_id: $user_source_id)
    }
  `),
);
