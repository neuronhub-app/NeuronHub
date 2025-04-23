import { ListContainer } from "@/components/posts/ListContainer";
import { type ResultOf, graphql } from "@/gql-tada";
import { PostFragment } from "@/graphql/fragments/posts";
import { useQuery } from "urql";

export function PostList() {
  const [{ data, error, fetching }] = useQuery({ query: PostListDoc });

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

export const PostListDoc = graphql(
  `
    query PostList {
      posts {
        ...PostFragment
      }
    }
  `,
  [PostFragment],
);

type PostList = ResultOf<typeof PostListDoc>["posts"];
export type Post = PostList[number];
