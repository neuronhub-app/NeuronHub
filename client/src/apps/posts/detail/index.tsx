import { PostDetail } from "@/components/posts/PostDetail";
import { graphql } from "@/gql-tada";
import { PostDetailFragment } from "@/graphql/fragments/posts";
import {} from "@chakra-ui/react";
import { useQuery } from "urql";
import type { Route } from "~/react-router/reviews/detail/+types/index";

export default function PostDetailRoute(props: Route.ComponentProps) {
  const [{ data, error, fetching }] = useQuery({
    query: PostDetailDoc,
    variables: { id: props.params.id },
  });

  return <PostDetail title="Post" post={data?.post} isLoading={fetching} error={error} />;
}

const PostDetailDoc = graphql(
  `
    query PostDetail($id: ID!) {
      post(id: $id) {
        ...PostDetailFragment
      }
    }
  `,
  [PostDetailFragment],
);
