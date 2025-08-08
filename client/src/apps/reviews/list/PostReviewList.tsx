import { ListContainer } from "@/components/posts/ListContainer";
import { graphql } from "@/gql-tada";
import { PostReviewFragment } from "@/graphql/fragments/reviews";
import { useGraphQL } from "@/urql/useGraphQL";

export function PostReviewList() {
  const { data, error, isLoading } = useGraphQL(
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
      isLoading={isLoading}
      error={error}
    />
  );
}
