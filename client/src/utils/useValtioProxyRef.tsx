import { env } from "@/env";
import type {} from "@redux-devtools/extension"; // see valtio docs re devtool types
import { useEffect, useRef } from "react";
import { useSnapshot } from "valtio/react";
import { devtools } from "valtio/utils";
import { proxy } from "valtio/vanilla";

/**
 * Helps to see at a glance all mutation and reads using IDE navigation with state/mutable/snap references.
 *
 * The [devtools](https://github.com/pmndrs/valtio/blob/main/docs/api/utils/devtools.mdx) integration
 * help to easily see every mutation.
 *
 * Hence used as the default rather than useState.
 *
 * Also, Vite's HMR stops working when Valtio is used outside of React lifecycle.
 * It starts to reset the state on every code change.
 */
export function useValtioProxyRef<T extends object>(
  val: T,
  devtoolsName?: string,
) {
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
