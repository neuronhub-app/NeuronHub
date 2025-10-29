import { ListContainer } from "@/components/posts/ListContainer";
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
  return (
    <ListContainer
      title={props.category ? `${props.category} Posts` : "Posts"}
      items={data?.posts ?? []}
      urlNamespace="posts"
      isLoadingFirstTime={isLoadingFirstTime}
      error={error}
    />
  );
}
