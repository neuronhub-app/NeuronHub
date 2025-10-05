import { ListContainer, type PostListItemType } from "@/components/posts/ListContainer";
import { graphql } from "@/gql-tada";
import { PostFragment } from "@/graphql/fragments/posts";
import { useApolloQuery } from "@/graphql/useApolloQuery";
import type { PostCategory } from "~/graphql/enums";

export function PostList(props: { category?: PostCategory }) {
  const variables = props.category ? { category: props.category } : {};
  const { data, error, isLoadingFirstTime } = useApolloQuery(
    graphql(
      `
				query PostList($category: PostCategory) {
					posts(filters: { type: { exact: Post }, category: { exact: $category } }) {
						...PostFragment
					}
				}
			`,
      [PostFragment],
    ),
    variables,
  );

  // @ts-expect-error #bad-infer
  const posts: PostListItemType[] = data?.posts ?? [];

  const title = props.category ? `${props.category} Posts` : "Posts";

  return (
    <ListContainer
      title={title}
      items={posts}
      urlNamespace="posts"
      isLoadingFirstTime={isLoadingFirstTime}
      error={error}
    />
  );
}
