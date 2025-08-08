import { useQuery } from "@tanstack/react-query";
import type { TadaDocumentNode } from "gql.tada";
import { graphqlClient } from "./graphqlClient";

export function useGraphQL<Data, Variables = Record<string, never>>(
  query: TadaDocumentNode<Data, Variables>,
  variables?: Variables,
) {
  return useQuery<Data>({
    queryKey: [query, variables],
    queryFn: async () => {
      if (variables) {
        return graphqlClient.request(query as any, variables as any);
      }
      return graphqlClient.request(query as any);
    },
  });
}
