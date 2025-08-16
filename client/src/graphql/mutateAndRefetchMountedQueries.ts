import type { OperationVariables } from "@apollo/client";
import { captureException } from "@sentry/react";
import type { TadaDocumentNode } from "gql.tada";
import toast from "react-hot-toast";
import { client } from "@/graphql/client";

export async function mutateAndRefetchMountedQueries<
  TData,
  TVariables extends OperationVariables = object,
>(
  mutation: TadaDocumentNode<TData, TVariables>,
  variables: TVariables,
): Promise<{
  data?: TData;
  success: boolean;
}> {
  try {
    const result = await client.mutate({ mutation, variables });

    await client.refetchQueries({ include: "active" });

    return { success: true, data: result.data ?? undefined };
  } catch (error) {
    captureException(error);
    const message = error instanceof Error ? error.message : "An error occurred";
    toast.error(message);
    return { success: false };
  }
}
