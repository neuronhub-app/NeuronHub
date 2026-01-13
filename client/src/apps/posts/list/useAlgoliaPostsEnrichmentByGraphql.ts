import { useMemo } from "react";
import { useDebounce } from "use-debounce";
import { graphql, type ID } from "@/gql-tada";
import { PostFragment, type PostFragmentType } from "@/graphql/fragments/posts";
import { useApolloQuery } from "@/graphql/useApolloQuery";

/**
 * If we store eg `.votes` in Algolia, then voting with `mutateAndRefetchMountedQueries` won't refetch `.votes` from BE.
 */
export function useAlgoliaPostsEnrichmentByGraphql(postsAlgolia: PostFragmentType[]) {
  const postIds = useMemo(() => postsAlgolia.map(post => post.id), [postsAlgolia]);

  const [postIdsDebounced] = useDebounce(postIds, 500, { leading: true });

  const { data } = useApolloQuery(
    PostsByIdsQuery,
    { ids: postIdsDebounced },
    { skip: postIdsDebounced.length === 0 },
  );

  const postsFromGraphql = useMemo(() => {
    const map = new Map<ID, PostFragmentType>();
    if (!data?.posts) {
      return map;
    }
    for (const post of data.posts) {
      map.set(post.id, post);
    }
    return map;
  }, [data?.posts]);

  const postsEnriched = useMemo(
    () =>
      postsAlgolia.map(post => {
        const graphqlPost = postsFromGraphql.get(post.id);
        if (!graphqlPost) {
          return post;
        }
        // Merge GraphQL data into Algolia post to preserve Algolia metadata (_highlightResult, __position, etc)
        return { ...post, ...graphqlPost };
      }),
    [postsAlgolia, postsFromGraphql],
  );
  return postsEnriched;
}

const PostsByIdsQuery = graphql.persisted(
  "PostsByIds",
  graphql(
    `
    query PostsByIds($ids: [ID!]!) {
      posts(filters: { id: { in_list: $ids } }) {
        ...PostFragment
      }
    }
  `,
    [PostFragment],
  ),
);
