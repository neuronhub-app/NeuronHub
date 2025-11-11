import { captureException } from "@sentry/react";
import { type DependencyList, useEffect } from "react";

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
  return useEffect(() => {
    if (!options.isReady) {
      return;
    }
    const initOutput = options.onInit();
    if (initOutput instanceof Promise) {
      initOutput.catch(captureException); // todo UI: add .error() toast
    } else {
      return initOutput;
    }
  }, [...deps, options.isReady]);
}
