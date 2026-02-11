import type { TadaDocumentNode } from "gql.tada";
import { useMemo } from "react";
import { useDebounce } from "use-debounce";
import type { ID } from "@/gql-tada";
import { useApolloQuery } from "@/graphql/useApolloQuery";

/**
 * If we store eg `.votes` in Algolia, then voting with `mutateAndRefetchMountedQueries` won't refetch `.votes` from BE.
 * So we enrich Algolia hits with GraphQL data by querying by IDs & again on `mutateAndRefetch`.
 */
export function useAlgoliaEnrichmentByGraphql<TItem extends { id: ID }>(
  algoliaItems: TItem[],
  // biome-ignore lint/suspicious/noExplicitAny: query data/vars type varies per consumer — type safety is at call-site wrappers
  query: TadaDocumentNode<any, any>,
  extractItems: (data: Record<string, TItem[]>) => TItem[],
): TItem[] {
  const ids = useMemo(() => algoliaItems.map(item => item.id), [algoliaItems]);

  const [idsDebounced] = useDebounce(ids, 500, { leading: true });

  const { data } = useApolloQuery(
    query,
    { ids: idsDebounced },
    { skip: idsDebounced.length === 0 },
  );

  const itemsFromGraphql = useMemo(() => {
    const map = new Map<ID, TItem>();
    if (!data) {
      return map;
    }
    for (const item of extractItems(data)) {
      map.set(item.id, item);
    }
    return map;
  }, [data, extractItems]);

  return useMemo(
    () =>
      algoliaItems.map(item => {
        const graphqlItem = itemsFromGraphql.get(item.id);
        if (!graphqlItem) {
          return item;
        }
        // Merge GraphQL data into Algolia item to preserve Algolia metadata (_highlightResult, __position, etc)
        return { ...item, ...graphqlItem };
      }),
    [algoliaItems, itemsFromGraphql],
  );
}
