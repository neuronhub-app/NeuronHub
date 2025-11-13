import { captureException } from "@sentry/react";
import toast from "react-hot-toast";
import { PostCreateForm } from "@/apps/posts/create/PostCreateForm";
import { graphql } from "@/gql-tada";
import { PostEditFragment } from "@/graphql/fragments/posts";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import type { Route } from "~/react-router/posts/edit/+types/index";

export default function PostEditRoute(props: Route.ComponentProps) {
  const { data, error, isLoadingFirstTime } = useApolloQuery(
    graphql.persisted(
      "PostEdit",
      graphql(`query PostEdit($id: ID!) { post(pk: $id) { ...PostEditFragment } }`, [
        PostEditFragment,
      ]),
    ),
    { id: props.params.id },
  );

  if (error) {
    toast.error("Load error");
    captureException(error);
  }
  if (isLoadingFirstTime) {
    return <div>Loading...</div>;
  }
  if (!data?.post) {
    return <div>Post not found</div>;
  }
  return <PostCreateForm.Comp post={data?.post ?? undefined} />;
}
