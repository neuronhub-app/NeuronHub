import { useEffect } from "react";
import { proxy } from "valtio";
import { useSnapshot } from "valtio/react";
import { env } from "@/env";

const state = proxy({ value: env.VITE_PROJECT_NAME });

/**
 * Hard to believe react-router lacks it. Whatever.
 */
export function useMetaTitle(args?: { isLoading: boolean }) {
  const snap = useSnapshot(state);

  useEffect(() => {
    if (args?.isLoading) {
      state.value = `Loading ${postfix}`;
    }
  }, []);

  const postfix = `- ${env.VITE_PROJECT_NAME}`;

  return {
    set: (titleNew: string) => {
      state.value = `${titleNew} ${postfix}`;
    },
    value: snap.value,
  };
}
