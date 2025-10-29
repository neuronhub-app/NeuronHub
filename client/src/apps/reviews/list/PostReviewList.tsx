import { ListContainer } from "@/components/posts/ListContainer";
import { graphql } from "@/gql-tada";
import { PostReviewFragment } from "@/graphql/fragments/reviews";
import { useApolloQuery } from "@/graphql/useApolloQuery";

export function PostReviewList() {
  const { data, error, isLoadingFirstTime } = useApolloQuery(
    graphql(
      `
        query ReviewList {
          post_reviews(ordering: { reviewed_at: DESC }) {
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
      isLoadingFirstTime={isLoadingFirstTime}
      error={error}
    />
  );
}
