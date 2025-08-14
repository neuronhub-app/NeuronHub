import { For, Heading, Stack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useUser } from "@/apps/users/useUserCurrent";
import { CommentCreateForm } from "@/components/posts/PostDetail/CommentCreateForm";
import { CommentThread } from "@/components/posts/PostDetail/CommentThread";
import { PostCard } from "@/components/posts/PostCard";
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

            <For each={props.post?.comments.filter(comment => !comment.parent)}>
              {comment => (
                // @ts-bad-inference
                <CommentThread key={comment.id} comment={comment as PostCommentType} />
              )}
            </For>

            {user && <CommentCreateForm parentId={props.post.id} />}
          </Stack>
        </Stack>
      )}
    </Stack>
  );
}
