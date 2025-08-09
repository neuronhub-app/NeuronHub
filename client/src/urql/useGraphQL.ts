import { useQuery } from "@tanstack/react-query";
import type { TadaDocumentNode } from "gql.tada";
import { graphqlClient } from "./graphqlClient";

export function useGraphQL<Data, Variables extends object = object>(
  query: TadaDocumentNode<Data, Variables>,
  variables?: Variables,
) {
  return useQuery<Data>({
    queryKey: [query, variables],
    queryFn: async () => {
      return graphqlClient.request(query, variables);
    },
  });
}
