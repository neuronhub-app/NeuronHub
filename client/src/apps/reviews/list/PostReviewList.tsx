import { ListContainer } from "@/components/posts/ListContainer";
import { type ResultOf, graphql } from "@/gql-tada";
import { PostReviewFragment } from "@/graphql/fragments/reviews";
import { useQuery } from "urql";

export function PostReviewList() {
  const [{ data, error, fetching }] = useQuery({ query: PostReviewListDoc });

  return (
    <ListContainer
      title="Reviews"
      items={data?.tool_reviews ?? []}
      urlNamespace="reviews"
      isLoading={fetching}
      error={error}
    />
  );
}

export const PostReviewListDoc = graphql(
  `
    query ReviewList {
      tool_reviews {
        ...PostReviewFragment
      }
    }
  `,
  [PostReviewFragment],
);

type PostReviewList = ResultOf<typeof PostReviewListDoc>["tool_reviews"];
export type PostReview = PostReviewList[number];
