import { useEffect, useRef } from "react";
import { subscribe } from "valtio";
import { useSnapshot } from "valtio/react";
import { devtools, proxySet } from "valtio/utils";
import { proxy } from "valtio/vanilla";
import { env } from "@/env";

/**
 * Used instead of useState by default.
 *
 * Shows at a glance all mutation/reads using IDE navigation with state/mutable/snap refs.
 *
 * And the [devtools](https://github.com/pmndrs/valtio/blob/main/docs/api/utils/devtools.mdx)
 * easily show every mutation.
 *
 * Warning: Vite's HMR resets the state of everything outside a React Component, eg Valtio's `proxy()`.
 *
 * todo refac: assert that any keys in `val` are not Set() or Map() - as proxy() won't handle them
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
    subscribe: (callback: () => void) => {
      subscribe(state, callback);
    },
  };
}

export const useStateValtio = useValtioProxyRef;

/**
 * Valtio doesn't support Map() and Set() objects with the `proxy()` construct.
 */
export function useStateValtioSet<T>(val: Iterable<T> | null, opts?: { devtoolsName?: string }) {
  const ref = useRef(proxySet(val));
  const state = ref.current;

  useEffect(() => {
    if (env.isDev) {
      devtools(state, { name: opts?.devtoolsName, enabled: true });
    }
  }, []);

  return {
    mutable: state,
    snap: useSnapshot(state),
    subscribe: (callback: () => void) => {
      subscribe(state, callback);
    },
  };
}
