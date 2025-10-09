import { Box, Button, For, HStack, Show, Text, VStack } from "@chakra-ui/react";
import { useUser } from "@/apps/users/useUserCurrent";
import { PostDatetime } from "@/components/posts/PostCard/PostDatetime";
import { CommentForm } from "@/components/posts/PostDetail/CommentForm";
import { CommentVoteBar } from "@/components/posts/PostDetail/CommentVoteBar";
import { ids } from "@/e2e/ids";
import type { ID } from "@/gql-tada";
import type { PostCommentType } from "@/graphql/fragments/posts";
import { useValtioProxyRef } from "@/utils/useValtioProxyRef";

export function CommentThread(props: { comment: PostCommentType }) {
  const user = useUser();

  const state = useValtioProxyRef({
    editingCommentId: null as null | ID,
    editingReplyId: null as null | ID,
  });

  const isAuthor = user?.id === props.comment.author?.id;
  const isEditing = state.snap.editingCommentId === props.comment.id;

  return (
    <Box>
      <VStack align="stretch" gap={4}>
        <Box p={4} borderWidth={1} borderRadius="md" borderColor="slate.subtle">
          <HStack mb={2} justify="space-between">
            <Box>
              <Text fontWeight="semibold" display="inline">
                {props.comment.author?.username}
              </Text>
              <PostDatetime
                datetimeStr={props.comment.created_at}
                style={{ display: "inline", ml: 2 }}
              />
            </Box>
            <HStack>
              <Show when={isAuthor && !isEditing}>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={() => {
                    state.mutable.editingCommentId = props.comment.id;
                  }}
                  {...ids.set(ids.comment.edit.btn)}
                >
                  Edit
                </Button>
              </Show>
              <CommentVoteBar comment={props.comment} />
            </HStack>
          </HStack>

          <Show
            when={isEditing}
            fallback={
              <Text whiteSpace="pre-wrap">
                {props.comment.content_polite ||
                  props.comment.content_direct ||
                  props.comment.content_rant ||
                  ""}
              </Text>
            }
          >
            <CommentForm
              mode="edit"
              comment={
                props.comment as Pick<PostCommentType, "id" | "content_polite" | "parent">
              }
              onCancel={() => {
                state.mutable.editingCommentId = null;
              }}
              onSave={() => {
                state.mutable.editingCommentId = null;
              }}
            />
          </Show>
        </Box>

        <Show when={user}>
          <Box ml={8}>
            <CommentForm mode="create" parentId={props.comment.id} />
          </Box>
        </Show>

        <Show when={props.comment.comments && props.comment.comments.length > 0}>
          <Box ml={8}>
            <VStack align="stretch" gap={4}>
              <For each={props.comment.comments ?? []}>
                {reply => {
                  const isReplyAuthor = user?.id === reply.author?.id;
                  const isEditingReply = state.snap.editingReplyId === reply.id;

                  return (
                    <Box key={reply.id} p={4} borderWidth={1} borderRadius="md">
                      <HStack mb={2} justify="space-between">
                        <Box>
                          <Text fontWeight="semibold" display="inline">
                            {reply.author?.username}
                          </Text>
                          <PostDatetime
                            datetimeStr={reply.created_at}
                            style={{ display: "inline", ml: 2 }}
                          />
                        </Box>
                        <HStack>
                          <Show when={isReplyAuthor && !isEditingReply}>
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => {
                                state.mutable.editingReplyId = reply.id;
                              }}
                              {...ids.set(ids.comment.edit.btn)}
                            >
                              Edit
                            </Button>
                          </Show>
                          <CommentVoteBar comment={reply} />
                        </HStack>
                      </HStack>
                      <Show
                        when={isEditingReply}
                        fallback={
                          <Text whiteSpace="pre-wrap">
                            {reply.content_polite ||
                              reply.content_direct ||
                              reply.content_rant ||
                              ""}
                          </Text>
                        }
                      >
                        <CommentForm
                          mode="edit"
                          comment={
                            reply as Pick<PostCommentType, "id" | "content_polite" | "parent">
                          }
                          onCancel={() => {
                            state.mutable.editingReplyId = null;
                          }}
                          onSave={() => {
                            state.mutable.editingReplyId = null;
                          }}
                        />
                      </Show>
                    </Box>
                  );
                }}
              </For>
            </VStack>
          </Box>
        </Show>
      </VStack>
    </Box>
  );
}
