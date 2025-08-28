import type { OperationVariables } from "@apollo/client";
import { Text } from "@chakra-ui/react";
import { captureException } from "@sentry/react";
import type { TadaDocumentNode } from "gql.tada";
import type { JSX } from "react";
import { client } from "@/graphql/client";

export function mutateAndRefetchMountedQueries<
  TData,
  TVariables extends OperationVariables = object,
>(mutation: TadaDocumentNode<TData, TVariables>, variables: TVariables) {
  return mutateAndRefetch(mutation, variables, { isRefetchAll: false });
}

export function mutateDeleteAndRefetchQueries<
  TData,
  TVariables extends OperationVariables = object,
>(mutation: TadaDocumentNode<TData, TVariables>, variables: TVariables) {
  return mutateAndRefetch(mutation, variables, { isRefetchAll: true });
}

async function mutateAndRefetch<TData, TVariables extends OperationVariables = object>(
  mutation: TadaDocumentNode<TData, TVariables>,
  variables: TVariables,
  options?: { isRefetchAll: boolean },
): Promise<
  | {
      success: true;
      data: TData;
    }
  | {
      data?: TData;
      success: false;
      error: string | JSX.Element;
    }
> {
  try {
    const result = await client.mutate({ mutation, variables });

    if (result.error) {
      return returnError(result.error);
    }

    if (options?.isRefetchAll) {
      await client.resetStore();
    } else {
      await client.refetchQueries({ include: "active" });
    }

    if (result.data === undefined) {
      return returnError(
        <>
          <Text>
            The server reported that your operation was completed, but responded abnormally -
            with nothing.
          </Text>
          <Text>Please carefully try again, or contact support.</Text>
        </>,
      );
    }

    return { success: true, data: result.data! };
  } catch (error) {
    return returnError(error);
  }
}

function returnError(error: Error | JSX.Element | unknown) {
  captureException(error);
  const message = error instanceof Error ? error.message : "An error occurred";
  return { success: false as const, error: message };
}
