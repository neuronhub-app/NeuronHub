import { ListContainer } from "@/components/posts/ListContainer";
import { graphql } from "@/gql-tada";
import { PostReviewFragment } from "@/graphql/fragments/reviews";
import { useQuery } from "urql";

export function PostReviewList() {
  const [{ data, error, fetching }] = useQuery({
    query: graphql(
      `
          query ReviewList {
            post_reviews {
              ...PostReviewFragment
            }
          }
        `,
      [PostReviewFragment],
    ),
  });

  return (
    <ListContainer
      title="Reviews"
      items={data?.post_reviews ?? []}
      urlNamespace="reviews"
      isLoading={fetching}
      error={error}
    />
  );
}
