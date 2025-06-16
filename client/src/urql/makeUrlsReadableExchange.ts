import type { OperationDefinitionNode } from "graphql/language/ast";
import type { ExchangeInput, ExchangeIO, Operation } from "urql";
import { pipe, tap } from "wonka";

/**
 * Changes the urls from:
 * - /api/graphql/
 * To:
 * - /api/graphql/?query={query_name}
 * - /api/graphql/?mutation={mutation_name}
 */
export function makeUrlsReadableExchange(input: ExchangeInput): ExchangeIO {
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
