import { captureException } from "@sentry/react";
import { type DependencyList, useEffect } from "react";

/**
 * A useEffect() wrapper for readability.
 * With async + loading blocking.
 */
export function useInit(options: {
  init: () => void | Promise<void>;
  deps?: DependencyList;
  isBlocked?: boolean;
}) {
  return useEffect(() => {
    if (options.isBlocked) {
      return;
    }
    const output = options.init();
    if (output instanceof Promise) {
      output.catch(captureException);
    } else {
      return output;
    }
  }, [options.deps, options.isBlocked]);
}
