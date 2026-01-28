import {
  Box,
  Flex,
  Heading,
  HStack,
  Show,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Spacer,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useUser } from "@/apps/users/useUserCurrent";
import { PostCard } from "@/components/posts/PostCard/PostCard";
import { CommentForm } from "@/components/posts/PostDetail/CommentForm";
import { CommentThread } from "@/components/posts/PostDetail/CommentThread";
import { useCommentTree } from "@/components/posts/PostDetail/useCommentTree";
import { useMetaTitle } from "@/components/useMetaTitle";
import type { PostDetailFragmentType } from "@/graphql/fragments/posts";
import type { PostReviewDetailFragmentType } from "@/graphql/fragments/reviews";
import { useInit } from "@/utils/useInit";

export function PostDetail(props: {
  post?: PostDetailFragmentType | PostReviewDetailFragmentType;
  isLoading: boolean;
  error?: Error | null;
  children?: ReactNode;
}) {
  const user = useUser();

  const comments = useCommentTree({ postId: props.post?.id });

  const title = useMetaTitle({ isLoading: true });

  useInit({
    isReady: Boolean(props.post?.id),
    onInit: () => {
      title.set(props.post!.title);
    },
  });

  const post = props.post;

  return (
    <Stack>
      {props.isLoading && <p>Loading...</p>}
      {props.error && <p>Error: {props.error.message}</p>}

      {post && (
        <Stack gap="gap.xl">
          <PostCard post={post} isDetailPage urlNamespace="posts" />

          <Stack gap={post.comment_count > 0 ? "gap.lg" : "0"}>
            <Flex gap="gap.md" align="center">
              <Heading fontSize="lg" display="flex" gap="gap.sm" alignItems="center">
                Comments <Text color="fg.subtle">{post.comment_count}</Text>
              </Heading>
              {!comments.isRenderCompleted && <Spinner size="sm" />}
            </Flex>

            <VStack px={0} align="flex-start" gap="gap.md">
              {post.comment_count > 0 && (
                <>
                  {comments.tree.map((comment, index) => (
                    <CommentThread
                      key={comment.id}
                      comment={comment}
                      post={post}
                      depth={0}
                      isLastChild={index === comments.tree.length - 1}
                      isFirstChild={true}
                      height={{ parent: 0, toolbar: 0, avatar: 0 }} // init values
                    />
                  ))}
                  <Show when={comments.isRendering}>
                    {[1, 2, 3, 4, 5, 6, 7].map(index => (
                      <CommentThreadSkeleton key={index} />
                    ))}
                  </Show>
                </>
              )}
            </VStack>

            <Show when={user}>
              <CommentForm
                mode="create"
                parentId={post.id}
                onClose={async () => comments.reload({ isForceReload: true })}
              />
            </Show>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}

function CommentThreadSkeleton() {
  return (
    <Box w="full" mt="gap.md">
      <Flex gap="gap.sm">
        <VStack gap={0}>
          <SkeletonCircle w={6} h={6} />
        </VStack>

        <VStack align="flex-start" gap="gap.sm" w="full">
          <VStack align="flex-start" px="1" rounded="l3" w="full" gap="3">
            <HStack>
              <Skeleton w={16} h={5} />
              <Skeleton w={16} h={5} />
            </HStack>
            <SkeletonText noOfLines={3} maxW="3xl" />
          </VStack>

          <Spacer w="1.5" h="full" />

          <Flex gap="gap.sm" px="1">
            <Skeleton w={5} h={5} />
            <Skeleton w={5} h={5} />
            <Skeleton w={10} h={5} />
          </Flex>
        </VStack>
      </Flex>
    </Box>
  );
}
