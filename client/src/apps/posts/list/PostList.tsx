import { ListContainer, type PostListItemType } from "@/components/posts/ListContainer";
import { graphql } from "@/gql-tada";
import { PostFragment } from "@/graphql/fragments/posts";
import { useApolloQuery } from "@/graphql/useApolloQuery";

export function PostList() {
  const { data, error, isLoadingInit } = useApolloQuery(
    graphql(
      `
				query PostList {
					posts(filters: { type: { exact: Post } }) {
						...PostFragment
					}
				}
			`,
      [PostFragment],
    ),
  );

  // @ts-expect-error bad infer
  const posts: PostListItemType[] = data?.posts ?? [];
  return (
    <ListContainer
      title="Posts"
      items={posts}
      urlNamespace="posts"
      isLoadingInit={isLoadingInit}
      error={error}
    />
  );
}
