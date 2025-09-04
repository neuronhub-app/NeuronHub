import { useValtioProxyRef } from "@/utils/useValtioProxyRef";

/** A simple wrap for .isLoading state in try/finally */
export function useIsLoading() {
  const state = useValtioProxyRef({ isLoading: false });

  return {
    isActive: state.snap.isLoading,

    track: async (func: () => Promise<unknown>) => {
      state.mutable.isLoading = true;
      try {
        await func();
      } finally {
        state.mutable.isLoading = false;
      }
    },
  };
}
