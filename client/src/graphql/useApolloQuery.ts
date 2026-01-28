import type { OperationVariables } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import type { DeepPartial } from "@apollo/client/utilities";
import type { TadaDocumentNode } from "gql.tada";
import { useRef } from "react";

export function useApolloQuery<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
>(
  query: TadaDocumentNode<TData, TVariables>,
  variables?: NoInfer<TVariables>,
  options?: { skip: boolean },
) {
  // Apollo bug: non-saved `query` loops React re-render
  const queryRef = useRef<TadaDocumentNode<TData, TVariables>>(query);

  const queryResult = useQuery(queryRef.current, {
    variables: variables ?? ({} as unknown as NoInfer<TVariables>),
    skip: options?.skip,
  });
  return {
    ...queryResult,
    isLoadingFirstTime: !queryResult.data && queryResult.loading,
  };
}

// unclear why Apollo keep wrapping all in their private type DeepPartialObject - it makes no sense, we never stream responses
// and Apollo's options.returnPartialData is false by default
export function isQueryDataComplete<T extends object>(
  data: DeepPartialObject<T> | undefined,
): data is T {
  return data !== undefined;
}

// This is a copy-pasted type that Apollo doesn't export:
type DeepPartialObject<T extends object> = { [K in keyof T]?: DeepPartial<T[K]> };
