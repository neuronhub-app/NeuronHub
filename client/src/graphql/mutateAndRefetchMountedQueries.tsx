import type { ErrorLike, OperationVariables } from "@apollo/client";
import { Box, Text } from "@chakra-ui/react";
import { captureException } from "@sentry/react";
import type { TadaDocumentNode } from "gql.tada";
import type { OperationDefinitionNode } from "graphql/language/ast";
import type { JSX } from "react";
import { client } from "@/graphql/client";

export function mutateAndRefetchMountedQueries<TData, TVariables extends OperationVariables>(
  mutation: TadaDocumentNode<TData, TVariables>,
  variables: TVariables,
) {
  return mutateAndRefetch(mutation, variables);
}

export function mutateDeleteAndResetStore<TData, TVariables extends OperationVariables>(
  mutation: TadaDocumentNode<TData, TVariables>,
  variables: TVariables,
) {
  return mutateAndRefetch(mutation, variables, { isResetAndRefetchAll: true });
}

export async function mutateAndRefetch<TData, TVariables extends OperationVariables>(
  mutation: TadaDocumentNode<TData, TVariables>,
  variables: TVariables,
  options?:
    | { isRefetchAll: true; isResetAndRefetchAll?: false }
    | { isRefetchAll?: false; isResetAndRefetchAll: true },
): Promise<
  | {
      success: true;
      data: TData;
    }
  | {
      data?: TData;
      success: false;
      errorMessage: string | JSX.Element;
      error: ErrorLike;
    }
> {
  try {
    const result = await client.mutate({ mutation, variables });

    if (result.error) {
      return returnError({ error: result.error });
    }

    if (options?.isResetAndRefetchAll) {
      await client.resetStore();
      await client.refetchQueries({ include: "all" });
    } else if (options?.isRefetchAll) {
      await client.refetchQueries({ include: "all" });
    } else {
      await client.refetchQueries({ include: "active" });
    }

    if (result.data === undefined) {
      return returnError({
        error: new Error("No response.data"),
        msg: (
          <Box>
            <Text>
              The server reported that your operation was completed, but responded abnormally -
              with nothing.
            </Text>
            <Text>Please carefully try again, or contact support.</Text>
          </Box>
        ),
      });
    }

    return { success: true, data: result.data };
  } catch (error) {
    if (logout.isLocalOnlyError(error, mutation)) {
      return logout.stubSuccess(mutation);
    }
    if (error instanceof Error) {
      return returnError({ error });
    }
    return returnError({ error: new Error(String(error)) });
  }
}

function returnError(args: { error: ErrorLike; msg?: JSX.Element }) {
  captureException(args.error);

  const message = args.error instanceof Error ? args.error.message : "An error occurred";
  return {
    success: false as const,
    error: args.error,
    errorMessage: args.msg ?? message,
  };
}

/**
 * A hack for a local-only error.
 */
namespace logout {
  export function isLocalOnlyError<TData, TVariables extends OperationVariables>(
    error: unknown,
    mutation: TadaDocumentNode<TData, TVariables>,
  ) {
    if (error instanceof Error) {
      const def = mutation.definitions?.[0] as unknown as OperationDefinitionNode;
      return error.name === "AbortError" && def?.name?.value === "Logout";
    }
    return false;
  }
  export function stubSuccess<TData, TVariables extends OperationVariables>(
    _mutation: TadaDocumentNode<TData, TVariables>,
  ) {
    return { success: true, data: { logout: true } as unknown as TData } as const;
  }
}
