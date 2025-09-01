import { ListContainer, type PostListItemType } from "@/components/posts/ListContainer";
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

  // @ts-expect-error bad infer
  const posts: PostListItemType[] = data?.post_reviews ?? [];
  return (
    <ListContainer
      title="Reviews"
      items={posts}
      urlNamespace="reviews"
      isLoadingFirstTime={isLoadingFirstTime}
      error={error}
    />
  );
}
