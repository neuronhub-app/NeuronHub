import { useEffect, useMemo, useRef, useState } from "react";
import { graphql, type ID } from "@/gql-tada";
import { PostFragment, type PostFragmentType } from "@/graphql/fragments/posts";
import { useApolloQuery } from "@/graphql/useApolloQuery";

/**
 * If we store eg `.votes` in Algolia, then voting with `mutateAndRefetchMountedQueries` won't refetch `.votes` from BE.
 */
export function useAlgoliaPostsEnrichmentByGraphql(postsAlgolia: PostFragmentType[]) {
  const postIds = useMemo(() => postsAlgolia.map(post => post.id), [postsAlgolia]);

  const postIdsDebounced = useDebouncedValue(postIds, 500);

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

// #AI - use `use-debounce` package
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip debounce on first render to show initial results immediately
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setDebouncedValue(value);
      return;
    }

    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
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
