import { captureException } from "@sentry/react";
import toast from "react-hot-toast";

import { PostDetail } from "@/components/posts/PostDetail";
import { graphql } from "@/gql-tada";
import { PostReviewDetailFragment } from "@/graphql/fragments/reviews";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import type { Route } from "~/react-router/reviews/detail/+types";

export default function PostReviewDetailRoute(props: Route.ComponentProps) {
  const { data, error, isLoadingFirstTime } = useApolloQuery(PostReviewDetailQuery, {
    pk: props.params.id,
  });
  if (error) {
    toast.error("Review load failed");
    captureException(error);
  }

  return (
    <PostDetail
      post={data?.post_review ?? undefined}
      isLoading={isLoadingFirstTime}
      error={error}
    />
  );
}
const PostReviewDetailQuery = graphql.persisted(
  "PostReviewDetail",
  graphql(
    `
      query PostReviewDetail($pk: ID!) {
        post_review(pk: $pk) {
          ...PostReviewDetailFragment
        }
      }
    `,
    [PostReviewDetailFragment],
  ),
);
