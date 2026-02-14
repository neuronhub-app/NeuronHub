import { captureException } from "@sentry/react";
import { type DependencyList, useEffect } from "react";
import { useStateValtio } from "@/utils/useValtioProxyRef";

/**
 * This is an async useEffect() wrapper.
 */
export function useInit(options: {
  onInit: () => void | Promise<void>;
  dependencies?: DependencyList;
  isReady?: string | boolean | number | null;
}) {
  const state = useStateValtio({ isLoading: false });

  useEffect(() => {
    if (!options.isReady) {
      return;
    }
    try {
      state.mutable.isLoading = true;

      const initOutput = options.onInit();

      if (initOutput instanceof Promise) {
        initOutput.catch(captureException); // todo ! UI: add .error() toast
        initOutput.finally(() => {
          state.mutable.isLoading = false;
        });
      } else {
        return initOutput;
      }
    } finally {
      state.mutable.isLoading = false;
    }
  }, [...(options.dependencies ?? []), options.isReady]);

  return {
    isLoading: state.snap.isLoading,
  };
}
