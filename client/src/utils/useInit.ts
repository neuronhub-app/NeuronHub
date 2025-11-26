import { captureException } from "@sentry/react";
import { type DependencyList, useEffect } from "react";
import { useStateValtio } from "@/utils/useValtioProxyRef";

/**
 * A useEffect() wrapper for readability.
 * With async + loading blocking.
 */
export function useInit(options: {
  onInit: () => void | Promise<void>;
  deps?: DependencyList;
  isReady?: string | boolean | number | null;
}) {
  const deps = options.deps ?? [];

  const state = useStateValtio({ isLoading: false });

  useEffect(() => {
    if (!options.isReady) {
      return;
    }
    state.mutable.isLoading = true;

    const initOutput = options.onInit();

    if (initOutput instanceof Promise) {
      initOutput.catch(captureException); // todo UI: add .error() toast
      initOutput.finally(() => {
        state.mutable.isLoading = false;
      });
    } else {
      return initOutput;
    }
  }, [...deps, options.isReady]);

  return {
    isLoading: state.snap.isLoading,
  };
}
