import { ListContainer, type PostListItemType } from "@/components/posts/ListContainer";
import { graphql } from "@/gql-tada";
import { PostFragment } from "@/graphql/fragments/posts";
import { useApolloQuery } from "@/graphql/useApolloQuery";

export function PostToolList() {
  const { data, error, isLoadingFirstTime } = useApolloQuery(
    graphql(
      `
        query ToolList {
          post_tools(filters: {}) {
            ...PostFragment
          }
        }
      `,
      [PostFragment],
    ),
  );

  // @ts-expect-error #bad-infer
  const posts: PostListItemType[] = data?.post_tools ?? [];
  return (
    <ListContainer
      title="Tools"
      items={posts}
      urlNamespace="tools"
      isLoadingFirstTime={isLoadingFirstTime}
      error={error}
    />
  );
}
