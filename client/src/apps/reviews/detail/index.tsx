import { useQuery } from "urql";
import { useUserCurrent } from "@/apps/users/useUserCurrent";
import { PostDetail } from "@/components/posts/PostDetail";
import { handleCommentSubmit } from "@/components/posts/comments/handleCommentSubmit";
import { graphql } from "@/gql-tada";
import { PostReviewDetailFragment } from "@/graphql/fragments/reviews";
import type { Route } from "~/react-router/reviews/detail/+types/index";

export default function PostReviewDetailRoute(props: Route.ComponentProps) {
  const userCurrent = useUserCurrent();

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
  const queryResult = useQuery({
    query,
    variables: { pk: props.params.id as string },
  });

  return (
    <PostDetail
      title="Post"
      post={queryResult[0].data?.post_review ?? undefined}
      isLoading={queryResult[0].fetching}
      error={queryResult[0].error}
      isAuthenticated={!!userCurrent.user}
      onCommentSubmit={handleCommentSubmit}
      onCommentCreated={() => {}}
    />
  );
}
