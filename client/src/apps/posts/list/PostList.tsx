import { useQuery } from "urql";
import { ListContainer } from "@/components/posts/ListContainer";
import { graphql } from "@/gql-tada";
import { PostFragment } from "@/graphql/fragments/posts";

export function PostList() {
  const [{ data, error, fetching }] = useQuery({
    query: graphql(
      `
          query PostList {
            posts(filters: { type: { exact: Post } }) {
              ...PostFragment
            }
          }
        `,
      [PostFragment],
    ),
  });

  return (
    <ListContainer
      title="Posts"
      items={data?.posts ?? []}
      urlNamespace="posts"
      isLoading={fetching}
      error={error}
    />
  );
}
