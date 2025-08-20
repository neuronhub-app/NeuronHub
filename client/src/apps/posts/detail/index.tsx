import { captureException } from "@sentry/react";
import toast from "react-hot-toast";
import { PostDetail } from "@/components/posts/PostDetail";
import { graphql } from "@/gql-tada";
import { PostDetailFragment, type PostDetailFragmentType } from "@/graphql/fragments/posts";
import { useApolloQuery } from "@/graphql/useApolloQuery";
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

  // @ts-expect-error #bad-infer, by Apollo
  const post: PostDetailFragmentType = data?.post ?? undefined;

  return <PostDetail title="Post" post={post} isLoading={isLoadingFirstTime} error={error} />;
}
