import { captureException } from "@sentry/react";
import toast from "react-hot-toast";

import { PostDetail } from "@/components/posts/PostDetail";
import { graphql } from "@/gql-tada";
import { PostDetailFragment, type PostDetailFragmentType } from "@/graphql/fragments/posts";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import type { Route } from "~/react-router/tools/detail/+types";

export default function PostToolDetailRoute(props: Route.ComponentProps) {
  const { data, error, isLoadingFirstTime } = useApolloQuery(
    graphql(`query PostToolDetail($pk: ID!) { post_tool(pk: $pk) { ...PostDetailFragment } }`, [
      PostDetailFragment,
    ]),
    { pk: props.params.id },
  );
  if (error) {
    toast.error("Tool load failed");
    captureException(error);
  }

  // @ts-expect-error #bad-infer, by Apollo
  const tool: PostDetailFragmentType = data?.post_tool ?? undefined;

  return <PostDetail title="Tool" post={tool} isLoading={isLoadingFirstTime} error={error} />;
}
