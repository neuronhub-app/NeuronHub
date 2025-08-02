import type { ExchangeInput, ExchangeIO, Operation } from "urql";
import { proxy } from "valtio/index";
import { pipe, tap } from "wonka";
import { urqlClient } from "@/urql/urqlClient";

type OperationKey = number;

const state = proxy({
  opsToRefetch: new Map<OperationKey, Operation>(),
  opsRefetching: new Set<OperationKey>(),
});

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
    let pendingTotal = 0;
    const pendingStep = 12;
    const pendingMax = 1000;

    function resolveIfCompleted() {
      if (state.opsRefetching.size === 0) {
        resolve();
      } else {
        pendingTotal += pendingStep;
        if (pendingTotal > pendingMax) {
          console.warn("Refetch timed out #react-router-urql-bug?");
          resolve();
        } else {
          setTimeout(resolveIfCompleted, pendingStep);
        }
      }
    }

    resolveIfCompleted();
  });
}

export function refetchQueriesExchange(input: ExchangeInput): ExchangeIO {
  return ops$ => {
    return pipe(
      pipe(
        ops$,
        tap((op: Operation) => {
          const isRefetchable = op.kind === "query";
          if (isRefetchable) {
            state.opsToRefetch.set(op.key, op);
          }
          if (op.kind === "teardown") {
            state.opsToRefetch.delete(op.key);
          }
        }),
      ),
      input.forward,
      tap(opResult => {
        // todo ! bug - on react-router nav backward w browser "Back" btn breaks this refetch
        // Using normal NavLink works fine.
        //
        // Reproduce:
        // 1. open /posts/
        // 2. open /reviews/
        // 3. go back to /posts/ with Back btn (here we load the old PostList from react-router cache)
        // 4. try to vote on a Post → [[refetchQueriesExchange.ts#refetchAllQueries]] won't reload query=PostList, because it was... never mounted? not sure #react-router-urql-bug
        state.opsRefetching.delete(opResult.operation.key);
      }),
    );
  };
}
