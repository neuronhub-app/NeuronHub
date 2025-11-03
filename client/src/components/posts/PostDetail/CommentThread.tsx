import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Spacer,
  Stack,
  Text,
  useToken,
  VStack,
} from "@chakra-ui/react";
import { type ComponentProps, type JSX, useEffect, useRef } from "react";
import { GoPencil } from "react-icons/go";
import { useSnapshot } from "valtio/react";

import { PostContentHighlighted } from "@/apps/highlighter/PostContentHighlighted";
import { useUser } from "@/apps/users/useUserCurrent";
import { getAvatarColorForUsername } from "@/components/posts/PostCard/PostAuthor";
import { PostDatetime } from "@/components/posts/PostCard/PostDatetime";
import { collapsedCommentsState } from "@/components/posts/PostDetail";
import { CommentForm } from "@/components/posts/PostDetail/CommentForm";
import { CommentVoteBar } from "@/components/posts/PostDetail/CommentVoteBar";
import { Tooltip } from "@/components/ui/tooltip";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import { client } from "@/graphql/client";
import type { PostCommentType, PostDetailFragmentType } from "@/graphql/fragments/posts";
import type { PostReviewDetailFragmentType } from "@/graphql/fragments/reviews";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";
import { UserListName } from "~/graphql/enums";

const styleGlobal = {
  indent: 9,
  childrenGap: "gap.md",
  zIndex: {
    avatar: 3,
    leftLine: 2,
    leftLineConnection: -1,
  },
} as const;

export function CommentThread(props: {
  post: PostDetailFragmentType | PostReviewDetailFragmentType;
  comment: PostCommentType;
  depth: number;
  isFirstChild: boolean;
  isLastChild: boolean;
  height: {
    parent: number;
    toolbar: number;
    avatar: number;
  };
}) {
  const user = useUser();

  const state = useValtioProxyRef({
    isEditing: false,
    isShowReplyForm: false,
    parentHeightPx: 0,
  });

  const refs = {
    container: useRef<HTMLElement | null>(null),
    content: useRef<HTMLDivElement | null>(null),
    toolbar: useRef<HTMLDivElement | null>(null),
    avatar: useRef<HTMLDivElement | null>(null),
  };

  const isHasChildren = Boolean(props.comment.comments?.length);
  const threadGuide = useCommentLeftLine({
    ...props,

    isHasChildren,
    height: {
      parent: state.snap.parentHeightPx,
      toolbar: refs.toolbar.current?.offsetHeight ?? 0,
      avatar: refs.avatar.current?.offsetHeight ?? 0,
    },
  });

  useEffect(() => {
    if (refs.container.current && refs.content.current) {
      state.mutable.parentHeightPx = refs.container.current.offsetHeight; // todo UI: get the latest child's h -> subtract it from refs.container
    }
  }, [refs.container.current, refs.content.current]);

  const isCommentUnfolded = !threadGuide.isCollapsed;
  const username = (props.comment.source_author || props.comment.author?.username) ?? "";

  return (
    <Box as="section" pos="relative" ref={refs.container}>
      <Flex ref={refs.content} as="article" gap="gap.sm" tabIndex={-1}>
        <VStack pos="relative" flexShrink={0} alignItems="center" gap={0}>
          <Avatar.Root
            size="2xs"
            colorPalette={getAvatarColorForUsername(username)}
            ref={refs.avatar}
            zIndex={styleGlobal.zIndex.avatar}
          >
            <Avatar.Fallback name={username} />
            <Avatar.Image src={props.comment.author?.avatar?.url} />
            <threadGuide.LineVerticalLeftConnection />
          </Avatar.Root>

          <threadGuide.LineVerticalLeft />
          <threadGuide.CommentCollapsedStub />
        </VStack>

        <VStack align="flex-start" gap={0} w="full">
          <Box aria-label="comment-box" px="1" rounded="l3" w="full">
            <HStack justify="space-between">
              {/* Header: Name, Date, Tags */}
              <HStack gap="gap.sm">
                <Text fontSize="sm" fontWeight="semibold">
                  {username}
                </Text>

                {props.comment.source_author === props.post.source_author && (
                  <Tooltip content="Original Poster" positioning={{ placement: "top" }}>
                    <Badge size="xs" variant="solid">
                      OP
                    </Badge>
                  </Tooltip>
                )}

                <PostDatetime
                  datetimeStr={
                    props.comment.post_source?.created_at_external ?? props.comment.created_at
                  }
                  size="xs"
                />
              </HStack>
            </HStack>

            {isCommentUnfolded &&
              (state.snap.isEditing ? (
                <CommentForm
                  mode="edit"
                  comment={props.comment}
                  onEditFinish={() => {
                    state.mutable.isEditing = false;
                  }}
                />
              ) : (
                <PostContentHighlighted post={props.comment} />
              ))}
          </Box>

          {isCommentUnfolded && (
            <Flex role="toolbar" ref={refs.toolbar}>
              <CommentVoteBar comment={props.comment} />

              <Spacer w="1.5" />

              {user && (
                <CommentToolbarButton
                  label="Reply"
                  onClick={() => {
                    state.mutable.isShowReplyForm = !state.snap.isShowReplyForm;
                  }}
                  id={ids.comment.btn.reply}
                />
              )}

              {user?.id === props.comment.author?.id && !state.snap.isEditing && (
                <CommentToolbarButton
                  label="Edit"
                  onClick={() => {
                    state.mutable.isEditing = true;
                  }}
                  icon={<GoPencil />}
                  id={ids.comment.btn.edit}
                />
              )}
            </Flex>
          )}

          {state.snap.isShowReplyForm && (
            <Box mt="gap.sm" w="full">
              <CommentForm
                mode="create"
                parentId={props.comment.id}
                onCancel={() => {
                  state.mutable.isShowReplyForm = false;
                }}
              />
            </Box>
          )}
        </VStack>
      </Flex>

      {threadGuide.isChildrenVisible && (
        <Stack gap={styleGlobal.childrenGap} mt="gap.md" pl={styleGlobal.indent}>
          {props.comment.comments.map((comment, index) => (
            <CommentThread
              key={comment.id}
              post={props.post}
              comment={comment}
              depth={props.depth + 1}
              isFirstChild={index === 0}
              isLastChild={index === props.comment.comments.length - 1}
              // todo refac: move to useCommentLeftLien; drop this comp props
              height={{
                parent: state.snap.parentHeightPx,
                toolbar: refs.toolbar.current?.offsetHeight ?? 0,
                avatar: refs.avatar.current?.offsetHeight ?? 0,
              }}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}

function CommentToolbarButton(props: {
  onClick: () => void;
  id: string;
  icon?: JSX.Element;
  label: string;
}) {
  return (
    <Button
      variant="ghost"
      size="2xs"
      color="fg.subtle"
      gap="gap.sm"
      onClick={props.onClick}
      {...ids.set(props.id)}
    >
      {props.icon} {props.label}
    </Button>
  );
}

function useCommentLeftLine(
  props: ComponentProps<typeof CommentThread> & { isHasChildren: boolean },
) {
  const user = useUser();
  const collapsedStateSnapshot = useSnapshot(collapsedCommentsState);

  const state = useValtioProxyRef({
    isCommentCollapsed: collapsedStateSnapshot.collapsedCommentIds.has(props.comment.id),
  });
  useEffect(() => {
    state.mutable.isCommentCollapsed = collapsedStateSnapshot.collapsedCommentIds.has(
      props.comment.id,
    );
  }, [collapsedStateSnapshot.collapsedCommentIds]);

  const [childrenGap] = useToken("spacing", styleGlobal.childrenGap);
  const style = {
    indent: styleGlobal.indent,
    childrenGap: childrenGap,
    line: {
      width: "2px",
      widthClickable: props.height.avatar ? `${props.height.avatar}px` : "full",
      color: "border",
      hover: {
        bg: { _light: "blackAlpha.50", _dark: "whiteAlpha.50" },
        color: "gray.600",
      },
    },
  } as const;

  async function toggleCollapse() {
    const newCollapsedState = !state.mutable.isCommentCollapsed;
    state.mutable.isCommentCollapsed = newCollapsedState;

    if (state.mutable.isCommentCollapsed) {
      collapsedCommentsState.collapsedCommentIds.add(props.comment.id);
    } else {
      collapsedCommentsState.collapsedCommentIds.delete(props.comment.id);
    }
    // save to db
    if (user) {
      await client.mutate({
        mutation: graphql(`
          mutation UpdateCollapsedComments($id: ID!, $list_field_name: UserListName!, $is_added: Boolean!) {
            update_user_list(id: $id, list_field_name: $list_field_name, is_added: $is_added)
          }
        `),
        variables: {
          id: props.comment.id,
          list_field_name: UserListName.PostsCollapsed,
          is_added: state.mutable.isCommentCollapsed,
        },
      });
    }
  }

  return {
    isChildrenVisible: props.isHasChildren && !state.snap.isCommentCollapsed,
    isCollapsed: state.snap.isCommentCollapsed,

    LineVerticalLeft: () => {
      if (state.snap.isCommentCollapsed) {
        return null;
      }
      return (
        <Box
          onClick={toggleCollapse}
          pos="absolute"
          aria-role="line"
          className="group"
          top={`${props.height.avatar / 2}px`}
          height={
            props.height.parent
              ? `calc(${props.height.parent}px - ${style.childrenGap} - ${props.height.toolbar}px)` // subtract - as parentHeightPx > Comment exactly by `stylesGlobal.childrenGap`
              : "full"
          }
          left="50%"
          transform="translateX(-50%)"
          w={style.line.widthClickable}
          cursor="pointer"
          zIndex={styleGlobal.zIndex.leftLine}
          _hover={{ bg: style.line.hover.bg }}
          {...ids.set(ids.comment.thread.line)}
        >
          <Box
            w={style.line.width}
            h="full"
            bg={style.line.color}
            mx="auto"
            _groupHover={{ bg: style.line.hover.color }}
          />
        </Box>
      );
    },
    LineVerticalLeftConnection: () => {
      const isTopNode = props.depth === 0;
      if (isTopNode) {
        return null;
      }
      if (props.isFirstChild || props.isLastChild) {
        return (
          <Box
            pos="absolute"
            h="full"
            width={styleGlobal.indent}
            ml={-styleGlobal.indent}
            mr={style.line.width}
            transform="translateY(-50%)"
            zIndex={styleGlobal.zIndex.leftLineConnection}
          >
            <Box
              pos="absolute"
              width={styleGlobal.indent}
              h="full"
              borderBottomWidth={style.line.width}
              borderLeftWidth={style.line.width}
              roundedBottomLeft="md"
              zIndex={styleGlobal.zIndex.leftLineConnection}
            />
          </Box>
        );
      }
    },
    CommentCollapsedStub: () => {
      if (state.snap.isCommentCollapsed) {
        const childrenCount = props.comment.comments?.length;
        return (
          <VStack
            minH={styleGlobal.indent}
            mb="gap.md"
            pos="relative"
            align="center"
            zIndex={0}
            gap={0}
          >
            <Box
              className="group"
              onClick={toggleCollapse}
              pos="relative"
              top={`-${props.height.avatar / 2}px`}
              w={style.line.widthClickable}
              h="50px"
              cursor="pointer"
              _hover={{ bg: style.line.hover.bg }}
              {...ids.set(ids.comment.thread.line)}
            >
              <Box
                w={style.line.width}
                h="full"
                mx="auto"
                bg={style.line.color}
                _groupHover={{ bg: style.line.hover.color }}
              />
              <Button
                position="absolute"
                bottom={0}
                left="50%"
                transform="translateX(-50%)"
                size="2xs"
                variant="subtle"
                colorPalette="gray"
                _groupHover={{ bg: "bg.emphasized" }}
              >
                {childrenCount ? `+ ${childrenCount}` : "Show"}
                {/* todo UX: also show unseen comments count */}
                {/* todo UX: show recursive count, not only direct chil */}
              </Button>
            </Box>
          </VStack>
        );
      }
    },
  };
}
