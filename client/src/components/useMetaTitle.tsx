import { useEffect } from "react";
import { proxy } from "valtio";
import { useSnapshot } from "valtio/react";
import { env } from "@/env";
import { siteConfig } from "@/sites";

const state = proxy({ value: siteConfig.meta?.title ?? env.VITE_PROJECT_NAME });

/**
 * Hard to believe react-router lacks it. Whatever.
 */
export function useMetaTitle(args?: { isLoading: boolean }) {
  const snap = useSnapshot(state);

  useEffect(() => {
    if (args?.isLoading) {
      state.value = `Loading - ${env.VITE_PROJECT_NAME}`;
    }
  }, []);

  return {
    set: (titleNew: string) => {
      state.value = `${titleNew} - ${env.VITE_PROJECT_NAME}`;
    },
    value: snap.value,
  };
}
