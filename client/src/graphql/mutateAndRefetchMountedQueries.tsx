import type { OperationVariables } from "@apollo/client";
import { Text } from "@chakra-ui/react";
import { captureException } from "@sentry/react";
import type { TadaDocumentNode } from "gql.tada";
import type { JSX } from "react";
import { client } from "@/graphql/client";

export async function mutateAndRefetchMountedQueries<
  TData,
  TVariables extends OperationVariables = object,
>(
  mutation: TadaDocumentNode<TData, TVariables>,
  variables: TVariables,
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

    await client.refetchQueries({ include: "active" });

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
