import { useQuery } from "urql";
import { createPostComment } from "@/apps/posts/services/createPostComment";
import { useUserCurrent } from "@/apps/users/useUserCurrent";
import { PostDetail } from "@/components/posts/PostDetail";
import { toaster } from "@/components/ui/toaster";
import { graphql } from "@/gql-tada";
import { PostReviewDetailFragment } from "@/graphql/fragments/reviews";
import type { Route } from "~/react-router/reviews/detail/+types/index";

export default function PostReviewDetailRoute(props: Route.ComponentProps) {
  const { user } = useUserCurrent();

  const query = graphql(
    `
        query PostReviewDetail($pk: ID!) {
          post_review(pk: $pk) {
            ...PostReviewDetailFragment
          }
        }
      `,
    [PostReviewDetailFragment],
  );
  const [{ data, error, fetching }, reexecuteQuery] = useQuery({
    query,
    variables: { pk: props.params.id as string },
  });

  const handleCommentSubmit = async (postId: string, content: string) => {
    try {
      await createPostComment({ parentId: postId, content });
      toaster.success({ title: "Comment posted" });
      reexecuteQuery({ requestPolicy: "network-only" });
    } catch (error) {
      toaster.error({
        title: "Failed to post comment",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <PostDetail
      title="Post"
      post={data?.post_review ?? undefined}
      isLoading={fetching}
      error={error}
      isAuthenticated={!!user}
      onCommentSubmit={handleCommentSubmit}
      onCommentCreated={() => reexecuteQuery({ requestPolicy: "network-only" })}
    />
  );
}
