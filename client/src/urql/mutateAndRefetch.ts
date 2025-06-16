import { captureException } from "@sentry/react";
import type { TadaDocumentNode } from "gql.tada";
import toast from "react-hot-toast";
import type { AnyVariables } from "urql";
import { refetchAllQueries } from "@/urql/refetchQueriesExchange";
import { urqlClient } from "@/urql/urqlClient";

export async function mutateAndRefetch<
  Data = any,
  Variables extends AnyVariables = AnyVariables,
>(
  query: TadaDocumentNode<Data, Variables>,
  variables: Variables,
): Promise<{ success: boolean }> {
  const res = await urqlClient.mutation(query, variables).toPromise();

  if (res.error) {
    captureException(res.error);
    toast.error(res.error.message);
    return { success: false };
  } else {
    await refetchAllQueries();
    return { success: true };
  }
}
