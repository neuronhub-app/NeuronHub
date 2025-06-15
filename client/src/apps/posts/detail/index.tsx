import { PostDetail } from "@/components/posts/PostDetail";
import { graphql } from "@/gql-tada";
import { PostDetailFragment } from "@/graphql/fragments/posts";
import {} from "@chakra-ui/react";
import { useQuery } from "urql";
import type { Route } from "~/react-router/posts/detail/+types/index";

export default function PostDetailRoute(props: Route.ComponentProps) {
  const query = graphql(
    `
      query PostDetail($pk: ID!) {
        post(pk: $pk) {
          ...PostDetailFragment
        }
      }
    `,
    [PostDetailFragment],
  );

  const [{ data, error, fetching }] = useQuery({
    query,
    variables: { pk: props.params.id as string },
  });
  if (error) {
  }

  return (
    <PostDetail title="Post" post={data?.post ?? undefined} isLoading={fetching} error={error} />
  );
}
