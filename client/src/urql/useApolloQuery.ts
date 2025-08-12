import type { OperationVariables } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import type { TadaDocumentNode } from "gql.tada";
import { useRef } from "react";

export function useApolloQuery<Data, Variables extends OperationVariables = OperationVariables>(
  query: TadaDocumentNode<Data, Variables>,
  variables?: Variables,
) {
  // for Apollo bug: non-saved `query` triggers infinite React re-render
  const queryRef = useRef<TadaDocumentNode<Data, Variables>>(query);

  return useQuery(
    queryRef.current,
    // @ts-expect-error Apollo types are bad
    { variables },
  );
}
