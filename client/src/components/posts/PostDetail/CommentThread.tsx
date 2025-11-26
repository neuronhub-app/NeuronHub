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
import { PostContentHighlighted } from "@/apps/highlighter/PostContentHighlighted";
import type { PostHighlight } from "@/apps/highlighter/useHighlighter";
import { useUser } from "@/apps/users/useUserCurrent";
import { getAvatarColorForUsername, PostAuthor } from "@/components/posts/PostCard/PostAuthor";
import { PostDatetime } from "@/components/posts/PostCard/PostDatetime";
import type { PostCommentTree } from "@/components/posts/PostDetail";
import { CommentForm } from "@/components/posts/PostDetail/CommentForm";
import { CommentVoteBar } from "@/components/posts/PostDetail/CommentVoteBar";
import { Tooltip } from "@/components/ui/tooltip";
import { ids } from "@/e2e/ids";
import { graphql, type ID } from "@/gql-tada";
import { client } from "@/graphql/client";
import {
  type PostDetailFragmentType,
  PostEditFragment,
  type PostEditFragmentType,
} from "@/graphql/fragments/posts";
import type { PostReviewDetailFragmentType } from "@/graphql/fragments/reviews";
import { toast } from "@/utils/toast";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";

const styleGlobal = {
  indent: 9,
  childrenGap: "gap.md",
  zIndex: {
    avatar: 3,
    leftLine: 2,
    leftLineConnection: 0,
  },
} as const;

export function CommentThread(props: {
  post: PostDetailFragmentType | PostReviewDetailFragmentType;
  comment: PostCommentTree;
  highlights: Record<ID, PostHighlight[]>;
  collapsedIds: Set<ID>;
  toggleCollapse: (id: ID) => void;
  depth: number;
  isFirstChild: boolean;
  isLastChild: boolean;
  height: {
    parent: number;
    toolbar: number;
    avatar: number;
  };
  refetchComments?: () => void;
}) {
  const user = useUser();

  const state = useValtioProxyRef({
    isEditing: false,
    isLoadingEdit: false,
    isShowReplyForm: false,
    parentHeightPx: 0,
    commentForEdit: null as PostEditFragmentType | null,
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
  }, [refs.container.current, refs.content.current, threadGuide.isCollapsed]);

  const isCommentUnfolded = !threadGuide.isCollapsed;
  const username =
    (props.comment?.post_source?.user_source?.username || props.comment.author?.username) ?? "";

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
            <Avatar.Root
              size="2xs"
              colorPalette={getAvatarColorForUsername(username)}
              ref={refs.avatar}
              zIndex={styleGlobal.zIndex.avatar}
            >
              <Avatar.Fallback name={username} />
              <Avatar.Image src={props.comment.author?.avatar?.url} />
            </Avatar.Root>

            <threadGuide.LineVerticalLeftConnection />
          </Box>

          <threadGuide.LineVerticalLeft />
          <threadGuide.CommentCollapsedStub />
        </VStack>

        <VStack align="flex-start" gap={0} w="full">
          <Box aria-label="comment-box" px="1" rounded="l3" w="full">
            <HStack justify="space-between">
              {/* Header: Name, Date, Tags */}
              <HStack gap="gap.sm">
                <Flex fontSize="sm" fontWeight="semibold">
                  <PostAuthor post={props.comment} isHideAvatar />
                </Flex>

                {props.comment?.post_source?.user_source?.username ===
                  props.post?.post_source?.user_source?.username && (
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
                state.snap.isLoadingEdit ? (
                  <Text fontSize="sm" color="fg.subtle">
                    Loading...
                  </Text>
                ) : state.snap.commentForEdit ? (
                  <CommentForm
                    mode="edit"
                    comment={state.snap.commentForEdit}
                    onClose={async () => {
                      state.mutable.isEditing = false;
                      state.mutable.commentForEdit = null;
                      await props.refetchComments?.();
                    }}
                  />
                ) : null
              ) : (
                <PostContentHighlighted post={props.comment} highlights={props.highlights} />
              ))}
          </Box>

          {isCommentUnfolded && <Spacer w="1.5" />}

          {isCommentUnfolded && user && (
            <Flex role="toolbar" ref={refs.toolbar}>
              <CommentVoteBar comment={props.comment} />

              <CommentToolbarButton
                label="Reply"
                onClick={() => {
                  state.mutable.isShowReplyForm = !state.snap.isShowReplyForm;
                }}
                id={ids.comment.btn.reply}
              />

              {user.id === props.comment.author?.id && !state.snap.isEditing && (
                <CommentToolbarButton
                  label="Edit"
                  onClick={async () => {
                    state.mutable.isLoadingEdit = true;
                    state.mutable.isEditing = true;

                    // Fetch comment with visibility fields before editing
                    const { data } = await client.query({
                      query: CommentEditQuery,
                      variables: { id: props.comment.id },
                    });

                    if (data?.post_comment) {
                      state.mutable.commentForEdit = data.post_comment;
                      state.mutable.isLoadingEdit = false;
                    } else {
                      toast.error("Failed to load comment for editing");
                      state.mutable.isEditing = false;
                      state.mutable.isLoadingEdit = false;
                    }
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
                onClose={async () => {
                  state.mutable.isShowReplyForm = false;
                  await props.refetchComments?.();
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
              highlights={props.highlights}
              collapsedIds={props.collapsedIds}
              toggleCollapse={props.toggleCollapse}
              depth={props.depth + 1}
              isFirstChild={index === 0}
              isLastChild={index === props.comment.comments.length - 1}
              // todo refac: move to useCommentLeftLien; drop this comp props
              height={{
                parent: state.snap.parentHeightPx,
                toolbar: refs.toolbar.current?.offsetHeight ?? 0,
                avatar: refs.avatar.current?.offsetHeight ?? 0,
              }}
              refetchComments={props.refetchComments}
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
  const isCommentCollapsed = props.collapsedIds.has(props.comment.id);

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

  function toggleCollapse() {
    props.toggleCollapse(props.comment.id);
  }

  return {
    isChildrenVisible: props.isHasChildren && !isCommentCollapsed,
    isCollapsed: isCommentCollapsed,

    LineVerticalLeft: () => {
      if (isCommentCollapsed) {
        return null;
      }

      const height = props.height.parent
        ? `calc(${props.height.parent}px - ${style.childrenGap} - ${props.height.toolbar}px)` // subtract - as parentHeightPx > Comment exactly by `stylesGlobal.childrenGap`
        : "full";

      return (
        <Box
          className="group"
          onClick={toggleCollapse}
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
      if (isCommentCollapsed) {
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
const CommentEditQuery = graphql.persisted(
  "CommentEdit",
  graphql(
    `query CommentEdit($id: ID!) {
      post_comment(pk: $id) {
        ...PostEditFragment
      }
    }`,
    [PostEditFragment],
  ),
);
