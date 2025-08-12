import { ListContainer, type PostListItemType } from "@/components/posts/ListContainer";
import { graphql } from "@/gql-tada";
import { PostReviewFragment } from "@/graphql/fragments/reviews";
import { useApolloQuery } from "@/urql/useApolloQuery";

export function PostReviewList() {
  const { data, error, isLoadingInit } = useApolloQuery(
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

  // @ts-expect-error bad infer
  const posts: PostListItemType[] = data?.post_reviews ?? [];
  return (
    <ListContainer
      title="Reviews"
      items={posts}
      urlNamespace="reviews"
      isLoadingInit={isLoadingInit}
      error={error}
    />
  );
}
