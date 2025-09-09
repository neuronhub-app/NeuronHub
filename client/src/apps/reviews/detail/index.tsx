import { captureException } from "@sentry/react";
import toast from "react-hot-toast";

import { PostDetail } from "@/components/posts/PostDetail";
import { graphql } from "@/gql-tada";
import {
  PostReviewDetailFragment,
  type PostReviewDetailFragmentType,
} from "@/graphql/fragments/reviews";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import type { Route } from "~/react-router/reviews/detail/+types";

export default function PostReviewDetailRoute(props: Route.ComponentProps) {
  const { data, error, isLoadingFirstTime } = useApolloQuery(
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
    { pk: props.params.id },
  );
  if (error) {
    toast.error("Review load failed");
    captureException(error);
  }

  // @ts-expect-error #bad-infer, by Apollo
  const review: PostReviewDetailFragmentType = data?.post_review ?? undefined;

  return (
    <PostDetail title="Review" post={review} isLoading={isLoadingFirstTime} error={error} />
  );
}
