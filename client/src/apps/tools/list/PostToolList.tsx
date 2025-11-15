import { ListContainer } from "@/components/posts/ListContainer";
import { graphql } from "@/gql-tada";
import { PostFragment } from "@/graphql/fragments/posts";
import { useApolloQuery } from "@/graphql/useApolloQuery";

export function PostToolList() {
  const { data, error, isLoadingFirstTime } = useApolloQuery(ToolListQuery);
  return (
    <ListContainer
      title="Tools"
      items={data?.post_tools ?? []}
      urlNamespace="tools"
      isLoadingFirstTime={isLoadingFirstTime}
      error={error}
    />
  );
}
const ToolListQuery = graphql.persisted(
  "ToolList",
  graphql(
    `query ToolList {
        post_tools(filters: {}) {
          ...PostFragment
        }
      }
    `,
    [PostFragment],
  ),
);
