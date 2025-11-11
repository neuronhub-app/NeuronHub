import { captureException } from "@sentry/react";
import toast from "react-hot-toast";
import { PostDetail } from "@/components/posts/PostDetail";
import { graphql } from "@/gql-tada";
import { PostDetailFragment } from "@/graphql/fragments/posts";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import { ErrorNotFound } from "@/root";
import type { Route } from "~/react-router/posts/detail/+types/index";

export default function PostDetailRoute(props: Route.ComponentProps) {
  const { data, error, isLoadingFirstTime } = useApolloQuery(
    graphql(`query PostDetail($pk: ID!) { post(pk: $pk) { ...PostDetailFragment } }`, [
      PostDetailFragment,
    ]),
    { pk: props.params.id },
  );

  if (error) {
    toast.error("Post load failed");
    captureException(error);
  }

  if (data?.post === null) {
    throw new ErrorNotFound();
  }

  return (
    <PostDetail post={data?.post ?? undefined} isLoading={isLoadingFirstTime} error={error} />
  );
}
