import { useValtioProxyRef } from "@/utils/useValtioProxyRef";

/** A simple shorthand for an .isLoading state in a try/finally */
export function useIsLoading<T>() {
  const state = useValtioProxyRef({ isLoading: false });

  return {
    isActive: state.snap.isLoading,

    track: async (func: () => Promise<unknown>, opts?: { finally?: () => void }) => {
      state.mutable.isLoading = true;
      try {
        await func();
      } finally {
        state.mutable.isLoading = false;
        opts?.finally?.();
      }
    },
  };
}
