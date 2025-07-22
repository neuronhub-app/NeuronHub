import { For, Heading, HStack, Stack, Text } from "@chakra-ui/react";
import type { ReactNode } from "react";
import type { CombinedError } from "urql";
import { CommentCreateForm } from "@/components/posts/CommentCreateForm";
import { CommentThread } from "@/components/posts/CommentThread";
import { PostCard } from "@/components/posts/PostCard";
import type { PostDetailFragmentType } from "@/graphql/fragments/posts";
import type { PostReviewDetailFragmentType } from "@/graphql/fragments/reviews";

export function PostDetail(props: {
  title: string;
  post: PostDetailFragmentType | PostReviewDetailFragmentType | undefined;
  isLoading: boolean;
  error?: CombinedError;
  children?: ReactNode;
  isAuthenticated?: boolean;
  onCommentSubmit?: (postId: string, content: string) => Promise<void>;
  onCommentCreated?: () => void;
}) {
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

            <For each={props.post.comments.filter(comment => !comment.parent)}>
              {comment => (
                <CommentThread
                  key={comment.id}
                  comment={comment as any}
                  onCommentCreated={props.onCommentCreated}
                />
              )}
            </For>

            {props.isAuthenticated && props.onCommentSubmit && props.post.type !== "Comment" && (
              <CommentCreateForm
                parentId={props.post.id}
                onSubmit={async data => props.onCommentSubmit!(props.post!.id, data.content)}
              />
            )}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
