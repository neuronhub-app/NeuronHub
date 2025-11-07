import { captureException } from "@sentry/react";
import toast from "react-hot-toast";
import { PostReviewForm } from "@/apps/reviews/create/PostReviewForm";
import { graphql } from "@/gql-tada";
import { PostReviewEditFragment } from "@/graphql/fragments/reviews";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import type { Route } from "~/react-router/reviews/edit/+types/index";

export default function PostReviewEditRoute(props: Route.ComponentProps) {
  const { data, error, isLoadingFirstTime } = useApolloQuery(
    graphql(
      `query PostReviewEdit($pk: ID!) { post_review(pk: $pk) { ...PostReviewEditFragment } }`,
      [PostReviewEditFragment],
    ),
    { pk: props.params.id },
  );

  if (error) {
    toast.error("Review load failed");
    captureException(error);
  }

  if (isLoadingFirstTime) {
    return <div>Loading...</div>;
  }

  if (!data?.post_review) {
    return <div>Review not found</div>;
  }
  return <PostReviewForm.Comp review={data?.post_review ?? undefined} />;
}
