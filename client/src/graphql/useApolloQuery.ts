import type { OperationVariables } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import type { TadaDocumentNode } from "gql.tada";
import { useRef } from "react";

export function useApolloQuery<Data, Variables extends OperationVariables = OperationVariables>(
  query: TadaDocumentNode<Data, Variables>,
  variables?: Variables,
) {
  // Apollo bug: non-saved `query` loops React re-render
  const queryRef = useRef<TadaDocumentNode<Data, Variables>>(query);

  const queryResult = useQuery(
    queryRef.current,
    // @ts-expect-error bad Apollo types
    { variables },
  );
  return {
    ...queryResult,
    isLoadingFirstTime: !queryResult.data && queryResult.loading,
  };
}
