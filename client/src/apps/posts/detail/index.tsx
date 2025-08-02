import { useQuery } from "urql";

import { useUserCurrent } from "@/apps/users/useUserCurrent";
import { handleCommentSubmit } from "@/components/posts/comments/handleCommentSubmit";
import { PostDetail } from "@/components/posts/PostDetail";
import { graphql } from "@/gql-tada";
import { PostDetailFragment } from "@/graphql/fragments/posts";
import type { Route } from "~/react-router/posts/detail/+types/index";

export default function PostDetailRoute(props: Route.ComponentProps) {
  const userCurrent = useUserCurrent();

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

  const queryResult = useQuery({
    query,
    variables: { pk: props.params.id },
  });

  return (
    <PostDetail
      title="Post"
      post={queryResult[0].data?.post ?? undefined}
      isLoading={queryResult[0].fetching}
      error={queryResult[0].error}
      isAuthenticated={!!userCurrent.user}
      onCommentSubmit={handleCommentSubmit}
      onCommentCreated={() => {}}
    />
  );
}
