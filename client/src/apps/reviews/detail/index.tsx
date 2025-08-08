import toast from "react-hot-toast";
import { PostDetail } from "@/components/posts/PostDetail";
import { graphql } from "@/gql-tada";
import { PostReviewDetailFragment } from "@/graphql/fragments/reviews";
import { useGraphQL } from "@/urql/useGraphQL";
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
  const { data, error, isLoading } = useGraphQL(query, { pk: props.params.id });
  if (error) {
    toast.error("Review load failed");
  }

  return (
    <PostDetail
      title="Review"
      post={data?.post_review ?? undefined}
      isLoading={isLoading}
      error={error}
    />
  );
}
