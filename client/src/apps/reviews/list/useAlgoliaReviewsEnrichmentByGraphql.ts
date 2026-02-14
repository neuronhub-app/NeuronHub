import { graphql } from "@/gql-tada";
import { PostReviewFragment, type PostReviewFragmentType } from "@/graphql/fragments/reviews";
import { useAlgoliaEnrichmentByGraphql } from "@/graphql/useAlgoliaEnrichmentByGraphql";

export function useAlgoliaReviewsEnrichmentByGraphql(reviewsAlgolia: PostReviewFragmentType[]) {
  return useAlgoliaEnrichmentByGraphql(
    reviewsAlgolia,
    ReviewsByIdsQuery,
    data => data.post_reviews,
  );
}

const ReviewsByIdsQuery = graphql.persisted(
  "ReviewsByIds",
  graphql(
    `
    query ReviewsByIds($ids: [ID!]!) {
      post_reviews(filters: { id: { in_list: $ids } }) {
        ...PostReviewFragment
      }
    }
  `,
    [PostReviewFragment],
  ),
);
