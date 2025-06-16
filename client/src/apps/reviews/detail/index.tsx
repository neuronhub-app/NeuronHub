import { useQuery } from "urql";
import { PostDetail } from "@/components/posts/PostDetail";
import { graphql } from "@/gql-tada";
import { PostReviewDetailFragment } from "@/graphql/fragments/reviews";
import type { Route } from "~/react-router/reviews/detail/+types/index";

export default function PostReviewDetailRoute(props: Route.ComponentProps) {
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
  const [{ data, error, fetching }] = useQuery({
    query,
    variables: { pk: props.params.id as string },
  });

  return (
    <PostDetail
      title="Post"
      post={data?.post_review ?? undefined}
      isLoading={fetching}
      error={error}
    />
  );
}
