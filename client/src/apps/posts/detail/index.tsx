import toast from "react-hot-toast";
import { useQuery } from "urql";
import { strs } from "@/apps/posts/detail/PostDetail";
import { createPostComment } from "@/apps/posts/services/createPostComment";
import { useUserCurrent } from "@/apps/users/useUserCurrent";
import { PostDetail } from "@/components/posts/PostDetail";
import { toaster } from "@/components/ui/toaster";
import { graphql } from "@/gql-tada";
import { PostDetailFragment } from "@/graphql/fragments/posts";
import type { Route } from "~/react-router/posts/detail/+types/index";

export default function PostDetailRoute(props: Route.ComponentProps) {
  const { user } = useUserCurrent();

  const query = graphql(
    `
      query PostDetail($pk: ID!) {
        post(pk: $pk) {
          ...PostDetailFragment
        }
      }
    `,
    [PostDetailFragment],
  );

  const [{ data, error, fetching }, reexecuteQuery] = useQuery({
    query,
    variables: { pk: props.params.id },
  });

  const handleCommentSubmit = async (postId: string, content: string) => {
    try {
      await createPostComment({ parentId: postId, content });
      toast.success(strs.createdComment);
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
      post={data?.post ?? undefined}
      isLoading={fetching}
      error={error}
      isAuthenticated={!!user}
      onCommentSubmit={handleCommentSubmit}
      onCommentCreated={() => reexecuteQuery({ requestPolicy: "network-only" })}
    />
  );
}
