import type { OperationVariables } from "@apollo/client";
import { captureException } from "@sentry/react";
import type { TadaDocumentNode } from "gql.tada";
import toast from "react-hot-toast";
import { apolloClient } from "@/urql/apolloClient";

export async function mutateAndRefetch<TData, TVariables extends OperationVariables = object>(
  mutation: TadaDocumentNode<TData, TVariables>,
  variables: TVariables,
): Promise<{
  data?: TData;
  success: boolean;
}> {
  try {
    const result = await apolloClient.mutate({ mutation, variables });

    // Force refetch all active queries to ensure UI updates
    await apolloClient.refetchQueries({ 
      include: "active",
      onQueryUpdated: (observableQuery) => {
        return observableQuery.refetch();
      }
    });

    return { success: true, data: result.data ?? undefined };
  } catch (error) {
    captureException(error);
    const message = error instanceof Error ? error.message : "An error occurred";
    toast.error(message);
    return { success: false };
  }
}
