import { captureException } from "@sentry/react";
import toast from "react-hot-toast";
import { ReviewCreateForm } from "@/apps/reviews/create/ReviewCreateForm";
import { graphql } from "@/gql-tada";
import { PostReviewEditFragment } from "@/graphql/fragments/reviews";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import type { Route } from "~/react-router/reviews/edit/+types/index";

export default function PostReviewEditRoute(props: Route.ComponentProps) {
  const { data, error, loading } = useApolloQuery(
    graphql(
      `
      query PostReviewEdit($pk: ID!) {
        post_review(pk: $pk) {
          ...PostReviewEditFragment
        }
      }
    `,
      [PostReviewEditFragment],
    ),
    { pk: props.params.id },
  );

  if (error) {
    toast.error("Review load failed");
    captureException(error);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!data?.post_review) {
    return <div>Review not found</div>;
  }
  // @ts-expect-error bad-infer by Apollo
  const review: PostReviewEditFragmentType = data?.post_review ?? undefined;
  return <ReviewCreateForm.Comp review={review} />;
}
