import type { Route } from "@/../.react-router/types/src/apps/reviews/detail/+types/index";
import { PostDetail } from "@/components/posts/PostDetail";
import { graphql } from "@/gql-tada";
import { PostReviewDetailFragment } from "@/graphql/fragments/reviews";
import {} from "@chakra-ui/react";
import { useQuery } from "urql";

export default function PostReviewDetail(props: Route.ComponentProps) {
  const [{ data, error, fetching }] = useQuery({
    query: PostReviewDetailDoc,
    variables: { id: props.params.id },
  });

  return <PostDetail title="Post" post={data?.tool_review} isLoading={fetching} error={error} />;
}

const PostReviewDetailDoc = graphql(
  `
    query PostReviewDetail($id: ID!) {
      tool_review(id: $id) {
        ...PostReviewDetailFragment
      }
    }
  `,
  [PostReviewDetailFragment],
);
