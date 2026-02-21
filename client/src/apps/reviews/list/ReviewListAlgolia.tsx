import { AlgoliaFacetAttribute } from "@/components/algolia/AlgoliaFacetAttribute";
import { AlgoliaFacetDate } from "@/components/algolia/AlgoliaFacetDate";
import { AlgoliaList } from "@/components/algolia/AlgoliaList";
import { PostCard } from "@/components/posts/PostCard/PostCard";
import { ids } from "@/e2e/ids";
import { graphql } from "@/gql-tada";
import { PostReviewFragment, type PostReviewFragmentType } from "@/graphql/fragments/reviews";
import { urls } from "@/urls";
import { PostTypeEnum } from "~/graphql/enums";

export function ReviewListAlgolia() {
  return (
    <AlgoliaList<PostReviewFragmentType>
      index="indexName"
      typeFilter={PostTypeEnum.Review}
      label="review"
      createUrl={urls.reviews.create}
      hits={{
        enrichment: {
          query: ReviewsByIdsQuery,
          extractItems: data => data.post_reviews,
        },
        renderHit: (review, _ctx) => (
          <PostCard key={review.id} post={review} urlNamespace="reviews" />
        ),
        listTestId: ids.post.list,
      }}
    >
      <AlgoliaFacetAttribute attribute="tags.name" label="Tags" isSearchEnabled />
      <AlgoliaFacetAttribute attribute="review_tags.name" label="Review Tags" isSearchEnabled />
      <AlgoliaFacetAttribute attribute="review_usage_status" label="Usage Status" />
      <AlgoliaFacetDate attribute="reviewed_at_unix" label="Reviewed At" />
    </AlgoliaList>
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
