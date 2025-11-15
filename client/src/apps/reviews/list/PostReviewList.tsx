import { ListContainer } from "@/components/posts/ListContainer";
import { graphql } from "@/gql-tada";
import { PostReviewFragment, type PostReviewFragmentType } from "@/graphql/fragments/reviews";
import { useApolloQuery } from "@/graphql/useApolloQuery";

export function PostReviewList() {
  const { data, error, isLoadingFirstTime } = useApolloQuery(ReviewListQuery);
  return (
    <ListContainer
      title="Reviews"
      items={filterOutReviewsOfPrivateTools(data?.post_reviews ?? [])}
      urlNamespace="reviews"
      isLoadingFirstTime={isLoadingFirstTime}
      error={error}
    />
  );
}
const ReviewListQuery = graphql.persisted(
  "ReviewList",
  graphql(
    `query ReviewList {
      post_reviews(ordering: { reviewed_at: DESC }) {
        ...PostReviewFragment
      }
    }`,
    [PostReviewFragment],
  ),
);

/**
 * Such case means the User has no access to the Tool,
 * but has access to its Review, so we hide both.
 *
 * Ref #95
 *
 * todo refac: must move to backend, once Strawberry has a decent API
 */
function filterOutReviewsOfPrivateTools(
  reviews?: PostReviewFragmentType[],
): PostReviewFragmentType[] {
  if (!reviews?.length) {
    return [];
  }
  return reviews.filter(review => review.parent !== null);
}
