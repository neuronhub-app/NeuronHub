import { For, Heading, Show, Stack, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useHighlighter } from "@/apps/highlighter/useHighlighter";
import { useUser } from "@/apps/users/useUserCurrent";
import { PostCard } from "@/components/posts/PostCard";
import { CommentForm } from "@/components/posts/PostDetail/CommentForm";
import { CommentThread } from "@/components/posts/PostDetail/CommentThread";
import type { PostCommentType, PostDetailFragmentType } from "@/graphql/fragments/posts";
import type { PostReviewDetailFragmentType } from "@/graphql/fragments/reviews";

export function PostDetail(props: {
  title: string;
  post?: PostDetailFragmentType | PostReviewDetailFragmentType;
  isLoading: boolean;
  error?: Error | null;
  children?: ReactNode;
}) {
  const user = useUser();

  const highlighter = useHighlighter({ comments: props.post?.comments });

  return (
    <Stack>
      <Heading size="2xl">{props.title}</Heading>
      {props.isLoading && <p>Loading...</p>}
      {props.error && <p>Error: {props.error.message}</p>}

      {props.post && (
        <Stack gap="gap.xl">
          <PostCard post={props.post} />

          <Stack gap="gap.lg">
            <Heading size="lg">Comments</Heading>

            <VStack px={0} align="flex-start" gap="gap.md">
              <For each={props.post.comments.filter(comment => !comment.parent)}>
                {comment => {
                  // @ts-expect-error #bad-infer
                  const commentTyped: PostCommentType = comment;

                  return (
                    <CommentThread
                      key={comment.id}
                      comment={highlighter.highlight(commentTyped)}
                      post={props.post!}
                    />
                  );
                }}
              </For>
            </VStack>

            <Show when={user}>
              <CommentForm mode="create" parentId={props.post.id} />
            </Show>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
