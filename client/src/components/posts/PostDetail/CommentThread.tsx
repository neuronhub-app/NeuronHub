import { Box, HStack, Text, VStack } from "@chakra-ui/react";
import { useUser } from "@/apps/users/useUserCurrent";
import { PostDatetime } from "@/components/posts/PostCard/PostDatetime";
import { CommentCreateForm } from "@/components/posts/PostDetail/CommentCreateForm";
import { CommentVoteBar } from "@/components/posts/PostDetail/CommentVoteBar";
import type { PostCommentType } from "@/graphql/fragments/posts";

export function CommentThread(props: { comment: PostCommentType }) {
  const user = useUser();

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

        {user && (
          <Box ml={8}>
            <CommentCreateForm parentId={props.comment.id} />
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
