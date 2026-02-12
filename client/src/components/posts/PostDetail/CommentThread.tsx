import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Show,
  Spacer,
  Stack,
  Text,
  useToken,
  VStack,
} from "@chakra-ui/react";
import { type ComponentProps, type JSX, useEffect, useMemo, useRef } from "react";
import { GoPencil } from "react-icons/go";

import { useStateValtio } from "@neuronhub/shared/utils/useStateValtio";

import { PostContentHighlighted } from "@/apps/highlighter/PostContentHighlighted";
import { useAuth } from "@/apps/users/useUserCurrent";
import { getAvatarColorForUsername, PostAuthor } from "@/components/posts/PostCard/PostAuthor";
import { PostDatetime } from "@/components/posts/PostCard/PostDatetime";
import { CommentForm } from "@/components/posts/PostDetail/CommentForm";
import { CommentVoteBar } from "@/components/posts/PostDetail/CommentVoteBar";
import type { useCommentCollapse } from "@/components/posts/PostDetail/useCommentCollapse";
import type { useCommentRead } from "@/components/posts/PostDetail/useCommentRead";
import {
  type PostCommentTree,
  useCommentTree,
} from "@/components/posts/PostDetail/useCommentTree";
import { Tooltip } from "@/components/ui/tooltip";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import { client } from "@/graphql/client";
import {
  type PostDetailFragmentType,
  PostEditFragment,
  type PostEditFragmentType,
} from "@/graphql/fragments/posts";
import type { PostReviewDetailFragmentType } from "@/graphql/fragments/reviews";
import { toast } from "@/utils/toast";

const styleGlobal = {
  indent: 9,
  childrenGap: "gap.md",
  zIndex: {
    avatarOverlay: 4,
    avatar: 3,
    leftLine: 2,
    leftLineConnection: 0,
  },
} as const;

export function CommentThread(props: {
  post: PostDetailFragmentType | PostReviewDetailFragmentType;
  comment: PostCommentTree;
  depth: number;
  isFirstChild: boolean;
  isLastChild: boolean;
  height: {
    parent: number;
    toolbar: number;
    avatar: number;
  };
  refetchComments: () => Promise<void>;
  collapse: ReturnType<typeof useCommentCollapse>;
  read: ReturnType<typeof useCommentRead>;
}) {
  const auth = useAuth();

  const state = useStateValtio({
    isEditing: false,
    isLoadingEdit: false,
    isShowReplyForm: false,
    parentHeightPx: 0,
    contentHeightPx: 0,
    commentForEdit: null as PostEditFragmentType | null,
  });

  const refs = {
    container: useRef<HTMLElement | null>(null),
    content: useRef<HTMLDivElement | null>(null),
    toolbar: useRef<HTMLDivElement | null>(null),
    avatar: useRef<HTMLDivElement | null>(null),
    children: useRef<HTMLDivElement | null>(null),
  };

  const comments = useCommentTree({ postId: props.post.id });

  const threadGuide = useCommentLeftLine({
    ...props,
    height: {
      parent: state.snap.parentHeightPx,
      toolbar: refs.toolbar.current?.offsetHeight ?? 0,
      avatar: refs.avatar.current?.offsetHeight ?? 0,
    },
  });

  useEffect(() => {
    const updateHeight = () => {
      if (refs.container.current && refs.content.current) {
        state.mutable.parentHeightPx = refs.container.current.offsetHeight;
        state.mutable.contentHeightPx = refs.content.current.offsetHeight;
      }
    };

    updateHeight();

    const timeoutId = setTimeout(updateHeight, 50);

    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    if (refs.children.current) {
      resizeObserver.observe(refs.children.current);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [
    refs.container.current,
    refs.content.current,
    state.snap.isShowReplyForm,
    state.snap.isEditing,
    threadGuide.isChildrenVisible,
  ]);

  const username =
    (props.comment?.post_source?.user_source?.username || props.comment.author?.username) ?? "";

  const avatarColorPalette = useMemo(() => {
    return getAvatarColorForUsername(username);
  }, [username]);

  return (
    <Box
      as="section"
      pos="relative"
      ref={refs.container}
      {...ids.set(ids.comment.thread.container)}
    >
      <Flex ref={refs.content} as="article" gap="gap.sm" tabIndex={-1}>
        <VStack aria-label="Comment Left Side Box" pos="relative" gap={0}>
          <Box aria-label="Comment Avatar Box" pos="relative">
            {comments.isRenderLowPrioAvatars ? (
              <Box pos="relative" ref={refs.avatar}>
                <Avatar.Root
                  colorPalette={avatarColorPalette}
                  size="2xs"
                  zIndex={styleGlobal.zIndex.avatar}
                  filter={threadGuide.isRead ? "grayscale(100%)" : "none"}
                  transitionProperty="filter"
                  transitionDuration="0.2s"
                >
                  <Avatar.Fallback name={username} />
                  <Avatar.Image src={props.comment.author?.avatar?.url} />
                </Avatar.Root>
                <Box
                  pos="absolute"
                  inset={0}
                  bg="bg.light"
                  opacity={threadGuide.isRead ? 0.5 : 0}
                  transitionProperty="opacity"
                  transitionDuration="0.2s"
                  zIndex={styleGlobal.zIndex.avatarOverlay}
                />
              </Box>
            ) : (
              <Box
                ref={refs.avatar}
                colorPalette={avatarColorPalette}
                pos="relative"
                boxSize="6"
                bg="colorPalette.muted"
                borderRadius="full"
                zIndex={styleGlobal.zIndex.avatar}
              />
            )}
            <threadGuide.LineVerticalLeftConnection />
          </Box>

          <threadGuide.LineVerticalLeft />

          {threadGuide.isCollapsed && <threadGuide.CommentCollapsedStub />}
        </VStack>

        <VStack align="flex-start" gap={0} w="full">
          <Box aria-label="comment-box" px="1" rounded="l3" w="full">
            <HStack justify="space-between">
              {/* Header: Name, Date, Tags */}
              <HStack gap="gap.sm">
                <Flex
                  fontSize="sm"
                  fontWeight={threadGuide.isRead ? "normal" : "semibold"}
                  transitionProperty="color"
                  transitionDuration="0.2s"
                >
                  <PostAuthor
                    post={props.comment}
                    isRenderAvatar={false}
                    color={threadGuide.isRead ? "fg.subtle" : "fg.default"}
                  />
                </Flex>

                {props.comment?.post_source?.user_source?.username ===
                  props.post?.post_source?.user_source?.username && (
                  <Tooltip content="Original Poster" positioning={{ placement: "top" }}>
                    <Badge size="xs" variant="subtle" colorPalette="teal">
                      {" "}
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

            <Show when={!threadGuide.isCollapsed}>
              {state.snap.isEditing && state.snap.commentForEdit ? (
                <CommentForm
                  mode="edit"
                  comment={state.snap.commentForEdit}
                  onClose={async () => {
                    state.mutable.isEditing = false;
                    state.mutable.commentForEdit = null;
                    await props.refetchComments();
                  }}
                />
              ) : (
                <PostContentHighlighted post={props.comment} />
              )}

              <Spacer w="1.5" />
            </Show>

            {state.snap.isLoadingEdit && (
              <Text fontSize="sm" color="fg.subtle">
                Loading...
              </Text>
            )}
          </Box>

          {auth.isLoggedIn && !threadGuide.isCollapsed && (
            <Flex ref={refs.toolbar} role="toolbar">
              <CommentToolbarButton
                label="[-]"
                onClick={() => props.collapse.toggle(props.comment.id)}
                id={ids.comment.btn.collapse}
                fontWeight="bold"
              />

              <CommentVoteBar comment={props.comment} />

              {comments.isRenderLowPrioReplyButtons && (
                <CommentToolbarButton
                  label="Reply"
                  onClick={() => {
                    state.mutable.isShowReplyForm = true;
                  }}
                  id={ids.comment.btn.reply}
                />
              )}

              {auth.userId === props.comment.author?.id && !state.snap.isEditing && (
                <CommentToolbarButton
                  label="Edit"
                  onClick={async () => {
                    state.mutable.isLoadingEdit = true;
                    state.mutable.isEditing = true;

                    // Fetch Comment with `.visibility_*` fields before editing
                    const { data } = await client.query({
                      query: CommentEditQuery,
                      variables: { id: props.comment.id },
                      fetchPolicy: "network-only",
                    });

                    if (data?.post_comment) {
                      state.mutable.commentForEdit = data.post_comment;
                    } else {
                      toast.error("Failed to load comment for editing");
                      state.mutable.isEditing = false;
                    }
                    state.mutable.isLoadingEdit = false;
                  }}
                  icon={<GoPencil />}
                  id={ids.comment.btn.edit}
                />
              )}
            </Flex>
          )}

          {state.snap.isShowReplyForm && !threadGuide.isCollapsed && (
            <Box mt="gap.sm" w="full">
              <CommentForm
                mode="create"
                parentId={props.comment.id}
                onClose={async () => {
                  state.mutable.isShowReplyForm = false;
                  await props.refetchComments();
                }}
              />
            </Box>
          )}
        </VStack>
      </Flex>

      {threadGuide.isChildrenVisible && (
        <Stack
          ref={refs.children}
          gap={styleGlobal.childrenGap}
          mt="gap.md"
          pl={styleGlobal.indent}
        >
          {props.comment.comments.map((comment, index) => (
            <CommentThread
              key={comment.id}
              post={props.post}
              comment={comment}
              refetchComments={props.refetchComments}
              collapse={props.collapse}
              read={props.read}
              depth={props.depth + 1}
              isFirstChild={index === 0}
              isLastChild={index === props.comment.comments.length - 1}
              // todo refac: move to useCommentLeftLien; drop this comp props
              height={{
                parent: state.snap.contentHeightPx,
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
  fontWeight?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="2xs"
      color="fg.subtle"
      gap="gap.sm"
      onClick={props.onClick}
      fontWeight={props.fontWeight}
      {...ids.set(props.id)}
    >
      {props.icon} {props.label}
    </Button>
  );
}

function countRecursive(comment: PostCommentTree): number {
  let count = 1;
  if (comment.comments) {
    for (const child of comment.comments) {
      count += countRecursive(child);
    }
  }
  return count;
}

function useCommentLeftLine(props: ComponentProps<typeof CommentThread>) {
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

  const isCollapsed = props.collapse.isCollapsed(props.comment.id);
  const isHasChildren = Boolean(props.comment.comments?.length);
  const isRead = props.read.isRead(props.comment.id);

  return {
    isChildrenVisible: isHasChildren && !isCollapsed,
    isCollapsed: isCollapsed,
    isRead: isRead,

    LineVerticalLeft: () => {
      if (isCollapsed) {
        return null;
      }

      const height = `calc(${props.height.parent}px - ${style.childrenGap} - ${props.height.toolbar}px)`;

      return (
        <Box
          className="group"
          onClick={() => props.read.toggle(props.comment.id)}
          pos="absolute"
          top={`${props.height.avatar / 2}px`}
          height={height}
          left="50%"
          transform="translateX(-50%)"
          w={style.line.widthClickable}
          cursor="pointer"
          zIndex={styleGlobal.zIndex.leftLine}
          _hover={{ bg: style.line.hover.bg }}
          borderRadius="md"
          transitionDuration="fast"
          {...ids.set(ids.comment.thread.line)}
        >
          <Box
            w={style.line.width}
            h="full"
            mx="auto"
            _groupHover={{ bg: style.line.hover.color }}
            bg={style.line.color}
            borderRadius="md"
            transitionDuration="fast"
          />
          {/*<Box*/}
          {/*  data-id="bottom-cap"*/}
          {/*  pos="absolute"*/}
          {/*  h={style.line.width}*/}
          {/*  bottom={0}*/}
          {/*  right={0}*/}
          {/*  w="50%"*/}
          {/*  transitionDuration="fast"*/}
          {/*>*/}
          {/*  <Box*/}
          {/*    pos="absolute"*/}
          {/*    h="full"*/}
          {/*    w="full"*/}
          {/*    borderBottomWidth={style.line.width}*/}
          {/*    borderLeftWidth={style.line.width}*/}
          {/*    roundedBottomLeft="md"*/}
          {/*    zIndex={styleGlobal.zIndex.leftLineConnection}*/}
          {/*    _groupHover={{ borderColor: style.line.hover.color }}*/}
          {/*    transitionDuration="fast"*/}
          {/*  />*/}
          {/*</Box>*/}
        </Box>
      );
    },

    LineVerticalLeftConnection: () => {
      const isTopComment = props.depth === 0;
      if (isTopComment) {
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
            // bad intuitiveness, but i tested it
            transform="translateY(-150%) translateX(30%)"
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
      const childrenCount = countRecursive(props.comment);

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
            onClick={() => props.read.toggle(props.comment.id)}
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
              onClick={e => {
                e.stopPropagation();
                props.collapse.toggle(props.comment.id);
              }}
            >
              + {childrenCount}
              {/* todo UX: also show unseen comments count */}
            </Button>
          </Box>
        </VStack>
      );
    },
  };
}

const CommentEditQuery = graphql.persisted(
  "CommentEdit",
  graphql(
    `
      query CommentEdit($id: ID!) {
        post_comment(pk: $id) {
          ...PostEditFragment
        }
      }
    `,
    [PostEditFragment],
  ),
);
