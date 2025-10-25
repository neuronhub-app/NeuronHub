import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  For,
  HStack,
  Show,
  Spacer,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { JSX } from "react";
import { GoPencil } from "react-icons/go";

import { PostContentHighlighted } from "@/apps/highlighter/PostContentHighlighted";
import { useUser } from "@/apps/users/useUserCurrent";
import { getAvatarColorForUsername } from "@/components/posts/PostCard/PostAuthor";
import { PostDatetime } from "@/components/posts/PostCard/PostDatetime";
import { CommentForm } from "@/components/posts/PostDetail/CommentForm";
import { CommentVoteBar } from "@/components/posts/PostDetail/CommentVoteBar";
import { Tooltip } from "@/components/ui/tooltip";
import { ids } from "@/e2e/ids";
import type { PostCommentType, PostDetailFragmentType } from "@/graphql/fragments/posts";
import type { PostReviewDetailFragmentType } from "@/graphql/fragments/reviews";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";

export function CommentThread(props: {
  post: PostDetailFragmentType | PostReviewDetailFragmentType;
  comment: PostCommentType;
  depth?: number;
  isLastChild?: boolean;
}) {
  const user = useUser();

  const state = useValtioProxyRef({
    isEditing: false,
    isShowReplyForm: false,
  });

  const username =
    (props.comment.source_author || props.comment.author?.username) ?? "Anonymous";

  return (
    <Box as="section" pos="relative">
      <LineToggle
        isHasChildren={props.comment.comments?.length > 0}
        isLastChild={props.isLastChild}
        depth={props.depth ?? 0}
      />

      <Flex as="article" gap="gap.sm" tabIndex={-1}>
        <Flex gap="gap.sm" flex="1">
          <Avatar.Root size="2xs" colorPalette={getAvatarColorForUsername(username)}>
            <Avatar.Fallback name={username} />
            <Avatar.Image src={props.comment.author?.avatar?.url} />
          </Avatar.Root>

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
                      props.comment.posts_source[0]?.created_at_external ??
                      props.comment.created_at
                    }
                    size="xs"
                  />
                </HStack>
              </HStack>

              {!state.snap.isEditing && <PostContentHighlighted post={props.comment} />}
              {state.snap.isEditing && (
                <CommentForm
                  mode="edit"
                  comment={props.comment}
                  onEditFinish={() => {
                    state.mutable.isEditing = false;
                  }}
                />
              )}
            </Box>

            <Flex role="toolbar">
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
      </Flex>

      {/* Children */}
      <Show when={props.comment.comments?.length}>
        <Stack gap="gap.md" mt="gap.md" pl={9}>
          <For each={props.comment.comments}>
            {(comment, index) => (
              <CommentThread
                key={comment.id}
                post={props.post}
                comment={comment}
                depth={(props.depth ?? 0) + 1}
                isLastChild={index === props.comment.comments.length - 1}
              />
            )}
          </For>
        </Stack>
      </Show>
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

function LineToggle(props: { isHasChildren: boolean; isLastChild?: boolean; depth: number }) {
  const left = -6;

  const avatarMiddle = 3;
  const avatarDistance = avatarMiddle * 2;

  const zIndex = {
    line: 0,
    lineHider: 1,
    lineChildRounded: 2,
  };
  return (
    <>
      {props.isHasChildren && (
        <Box
          pos="absolute"
          width="2px"
          left={avatarMiddle}
          top="0"
          bottom="0"
          borderStartWidth="2px"
          zIndex={zIndex.line}
        />
      )}
      {props.depth > 0 && (
        <Box
          pos="absolute"
          width={avatarDistance}
          height="9"
          left={left}
          top={left}
          bottom="0"
          borderStartWidth="2px"
          borderBottomWidth="2px"
          roundedBottomLeft="l3"
          zIndex={zIndex.lineChildRounded}
        />
      )}
      {props.isLastChild && props.depth > 0 && (
        <Box
          pos="absolute"
          width="px"
          left={left}
          top="0"
          bottom="0"
          borderStartWidth="2px"
          borderColor="bg.subtle"
          zIndex={zIndex.lineHider}
        />
      )}
    </>
  );
}
