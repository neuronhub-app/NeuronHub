import { ListContainer } from "@/components/posts/ListContainer";
import { graphql } from "@/gql-tada";
import { PostReviewFragment } from "@/graphql/fragments/reviews";
import { useApolloQuery } from "@/urql/useApolloQuery";

export function PostReviewList() {
  const { data, error, loading } = useApolloQuery(
    graphql(
      `
        query ReviewList {
          post_reviews {
            ...PostReviewFragment
          }
        }
      `,
      [PostReviewFragment],
    ),
  );

  return (
    <ListContainer
      title="Reviews"
      items={data?.post_reviews ?? []}
      urlNamespace="reviews"
      isLoading={loading}
      error={error}
    />
  );
}
