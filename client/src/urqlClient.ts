import {} from "@urql/core";
import type { OperationDefinitionNode } from "graphql/language/ast";
import {
  Client,
  type Exchange,
  type ExchangeIO,
  type ExchangeInput,
  type Operation,
  cacheExchange,
  fetchExchange,
} from "urql";
import { pipe, tap } from "wonka";

export const { refreshExchange, refreshAllQueries } = makeRefreshQueriesExchange();

export const urqlClient = new Client({
  url: "http://localhost:8000/api/graphql",
  exchanges: [namingExchange, cacheExchange, fetchExchange, refreshExchange],
  fetchOptions: {
    credentials: "include", // it isn't in TS type, and they say to use headers.credentials, but that's wrong.
    mode: "cors",
    cache: "no-cache",
  },
});

export function makeRefreshQueriesExchange(): {
  refreshExchange: Exchange;
  refreshAllQueries: () => void;
} {
  const operationsQuery = new Map<number, Operation>();

  function refreshExchange(input: ExchangeInput): ExchangeIO {
    return operations$ => {
      const processIncomingOperation = (op: Operation) => {
        if (op.kind === "query" || op.kind === "teardown") {
          operationsQuery.set(op.key, op);
        }
      };

      return input.forward(pipe(operations$, tap(processIncomingOperation)));
    };
  }

  function refreshAllQueries(): void {
    for (const operation of operationsQuery.values()) {
      urqlClient.reexecuteOperation(
        urqlClient.createRequestOperation("query", operation, {
          ...operation.context,
          requestPolicy: "network-only",
        }),
      );
    }
  }

  return { refreshExchange, refreshAllQueries };
}

/**
 * Changes the unreadable default url from:
 * - /api/graphql/
 * To:
 * - /api/graphql/?query={query_name}
 * - /api/graphql/?mutation={mutation_name}
 */
function namingExchange(input: ExchangeInput): ExchangeIO {
  return operations$ => {
    const processOperation = (operation: Operation) => {
      if (operation.kind === "teardown") {
        return;
      }
      const url = new URL(operation.context.url);
      const definition = operation.query.definitions[0] as OperationDefinitionNode;
      url.searchParams.set(operation.kind, String(definition.name?.value));
      operation.context.url = url.toString();
    };

    return input.forward(pipe(operations$, tap(processOperation)));
  };
}
