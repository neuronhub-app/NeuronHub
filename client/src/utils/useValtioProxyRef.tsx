import { env } from "@/env";
import type {} from "@redux-devtools/extension"; // see valtio docs re devtool types
import { useEffect, useRef } from "react";
import { useSnapshot } from "valtio/react";
import { devtools } from "valtio/utils";
import { proxy } from "valtio/vanilla";

/**
 * Used instead of useState by default.
 *
 * Shows at a glance all mutation/reads using IDE navigation with state/mutable/snap refs.
 *
 * The [devtools](https://github.com/pmndrs/valtio/blob/main/docs/api/utils/devtools.mdx)
 * easily show every mutation.
 *
 * Also, Vite's HMR resets the state on recompile, when Valtio is used outside of React lifecycle,
 * ie outside of a Component.
 */
export function useValtioProxyRef<T extends object>(val: T, devtoolsName?: string) {
  const ref = useRef(proxy(val));
  const state = ref.current;

  useEffect(() => {
    if (env.isDev) {
      devtools(state, { name: devtoolsName, enabled: true });
    }
  }, []);

  return {
    mutable: state,
    snap: useSnapshot(state),
  };
}
