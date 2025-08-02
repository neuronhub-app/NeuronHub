import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { useUserCurrent } from "@/apps/users/useUserCurrent";
import { PostDatetime } from "@/components/posts/PostCard/PostDatetime";
import { CommentCreateForm } from "@/components/posts/comments/CommentCreateForm";
import { CommentVoteBar } from "@/components/posts/comments/CommentVoteBar";
import { handleCommentSubmit } from "@/components/posts/comments/handleCommentSubmit";
import type { FragmentOf } from "@/gql-tada";
import type { PostCommentsFragment } from "@/graphql/fragments/posts";

type CommentType = FragmentOf<typeof PostCommentsFragment>["comments"][0];

interface CommentThreadProps {
  comment: CommentType;
  onCommentCreated?: () => void;
}

export function CommentThread(props: CommentThreadProps) {
  const userCurrent = useUserCurrent();

  async function onSubmit(data: { content: string }) {
    await handleCommentSubmit(props.comment.id, data.content);
    props.onCommentCreated?.();
  }

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
            <CommentVoteBar comment={props.comment} />
          </HStack>
          <Text whiteSpace="pre-wrap">{props.comment.content}</Text>
        </Box>

        {userCurrent.user && (
          <Box ml={8}>
            <CommentCreateForm parentId={props.comment.id} onSubmit={onSubmit} />
          </Box>
        )}

        {props.comment.comments?.length > 0 && (
          <Box ml={8}>
            <VStack align="stretch" gap={4}>
              {props.comment.comments.map(reply => (
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
                    <CommentVoteBar comment={reply} />
                  </HStack>
                  <Text whiteSpace="pre-wrap">{reply.content}</Text>
                </Box>
              ))}
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
