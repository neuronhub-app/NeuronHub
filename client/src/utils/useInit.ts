import { captureException } from "@sentry/react";
import { type DependencyList, useEffect } from "react";

/**
 * A useEffect() wrapper for readability.
 * With async + loading blocking.
 */
export function useInit(options: {
  onInit: () => void | Promise<void>;
  deps?: DependencyList;
  isBlocked?: boolean;
}) {
  return useEffect(() => {
    if (options.isBlocked) {
      return;
    }
    const initOutput = options.onInit();
    if (initOutput instanceof Promise) {
      initOutput.catch(captureException);
    } else {
      return initOutput;
    }
  }, [options.deps, options.isBlocked]);
}
