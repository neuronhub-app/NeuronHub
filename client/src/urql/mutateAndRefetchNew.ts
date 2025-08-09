import { captureException } from "@sentry/react";
import type { TadaDocumentNode } from "gql.tada";
import toast from "react-hot-toast";
import { graphqlClient } from "./graphqlClient";
import { queryClient } from "./queryClient";

export async function mutateAndRefetch<Data, Variables extends object>(
  query: TadaDocumentNode<Data, Variables>,
  variables: Variables,
): Promise<{ success: boolean; data?: Data }> {
  try {
    // graphql-request v7 requires explicit typing due to overload issues
    const client = graphqlClient as {
      request<T, V extends object = object>(
        document: TadaDocumentNode<T, V>,
        variables: V,
      ): Promise<T>;
    };

    const data = await client.request(query, variables);

    queryClient.invalidateQueries();

    return { success: true, data };
  } catch (error) {
    captureException(error);
    const message = error instanceof Error ? error.message : "An error occurred";
    toast.error(message);
    return { success: false };
  }
}
