import { urqlClient } from "@/urql/urqlClient";
import type { ExchangeIO, ExchangeInput, Operation } from "urql";
import { proxy } from "valtio/index";
import { pipe, tap } from "wonka";

type OperationKey = number;

const state = proxy({
  opsToRefetch: new Map<OperationKey, Operation>(),
  opsRefetching: new Set<OperationKey>(),
});

export function refetchExchange(input: ExchangeInput): ExchangeIO {
  return ops$ => {
    return pipe(
      pipe(
        ops$,
        tap((op: Operation) => {
          const isRefetchable = op.kind === "query" || op.kind === "teardown";
          if (isRefetchable) {
            state.opsToRefetch.set(op.key, op);
          }
        }),
      ),
      input.forward,
      tap(opResult => {
        state.opsRefetching.delete(opResult.operation.key);
      }),
    );
  };
}

/**
 * reexecuteOperation() only triggers queries with listeners, eg mounted useQuery()
 *
 * urql is quite bad at Promises, so we poll
 */
export async function refetchAllQueries() {
  for (const op of state.opsToRefetch.values()) {
    urqlClient.reexecuteOperation(
      urqlClient.createRequestOperation("query", op, {
        ...op.context,
        requestPolicy: "network-only",
      }),
    );
    state.opsRefetching.add(op.key);
  }

  return new Promise<void>(resolve => {
    function resolveIfCompleted() {
      if (state.opsRefetching.size === 0) {
        resolve();
      } else {
        setTimeout(resolveIfCompleted, 12);
      }
    }

    resolveIfCompleted();
  });
}
