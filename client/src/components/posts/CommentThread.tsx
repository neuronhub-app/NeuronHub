import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { createPostComment } from "@/apps/posts/services/createPostComment";
import { useUserCurrent } from "@/apps/users/useUserCurrent";
import { CommentCreateForm } from "@/components/posts/CommentCreateForm";
import { CommentVoteBar } from "@/components/posts/CommentVoteBar";
import { PostDatetime } from "@/components/posts/PostCard/PostDatetime";
import { toaster } from "@/components/ui/toaster";
import type { FragmentOf } from "@/gql-tada";
import type { PostCommentsFragment } from "@/graphql/fragments/posts";

type CommentType = FragmentOf<typeof PostCommentsFragment>["comments"][0];

interface CommentThreadProps {
  comment: CommentType;
  onCommentCreated?: () => void;
}

export function CommentThread({ comment, onCommentCreated }: CommentThreadProps) {
  const { user: authenticatedUser } = useUserCurrent();

  const handleCommentSubmit = async (data: { content: string }) => {
    try {
      await createPostComment({ parentId: comment.id, content: data.content });
      toaster.success({ title: "Reply posted" });
      onCommentCreated?.();
    } catch (error) {
      toaster.error({
        title: "Failed to post reply",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <Box>
      <VStack align="stretch" gap={4}>
        <Box p={4} borderWidth={1} borderRadius="md" borderColor="slate.subtle">
          <HStack mb={2} justify="space-between">
            <Box>
              <Text fontWeight="semibold" display="inline">
                {comment.author?.username}
              </Text>
              <PostDatetime
                datetimeStr={comment.created_at}
                style={{ display: "inline", ml: 2 }}
              />
            </Box>
            <CommentVoteBar comment={comment} />
          </HStack>
          <Text whiteSpace="pre-wrap">{comment.content}</Text>
        </Box>

        {authenticatedUser && (
          <Box ml={8}>
            <CommentCreateForm parentId={comment.id} onSubmit={handleCommentSubmit} />
          </Box>
        )}

        {comment.comments?.length > 0 && (
          <Box ml={8}>
            <VStack align="stretch" gap={4}>
              {comment.comments.map(reply => (
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
