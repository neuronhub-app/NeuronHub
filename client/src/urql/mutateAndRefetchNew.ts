import { captureException } from "@sentry/react";
import type { TadaDocumentNode } from "gql.tada";
import toast from "react-hot-toast";
import { graphqlClient } from "./graphqlClient";
import { queryClient } from "./queryClient";

export async function mutateAndRefetch<Data = any, Variables = Record<string, any>>(
  query: TadaDocumentNode<Data, Variables>,
  variables: Variables,
): Promise<{ success: boolean; data?: Data }> {
  try {
    const data = (await graphqlClient.request(query as any, variables as any)) as Data;

    queryClient.invalidateQueries();

    return { success: true, data };
  } catch (error) {
    captureException(error);
    const message = error instanceof Error ? error.message : "An error occurred";
    toast.error(message);
    return { success: false };
  }
}
