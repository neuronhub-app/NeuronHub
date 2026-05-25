import { env } from "@neuronhub/shared/createEnv";
import { useEffect, useState } from "react";
import { subscribe } from "valtio";
import { useSnapshot } from "valtio/react";
import { devtools, proxySet } from "valtio/utils";
import { proxy } from "valtio/vanilla";

/**
 * Used instead of useState by default.
 *
 * Shows at a glance all mutation/reads using IDE navigation with state/mutable/snap refs.
 *
 * And the [devtools](https://github.com/pmndrs/valtio/blob/main/docs/api/utils/devtools.mdx)
 * easily show every mutation.
 *
 * Note: Vite's HMR resets the state of everything outside a React Component, eg Valtio's `proxy()`
 * (unless its imported from another file).
 *
 * todo ! refac: assert that any keys in `val` are not Set() or Map() - as proxy() won't handle them
 */
export function useStateValtio<T extends object>(val: T) {
  const [state] = useState(() => proxy(val));

  useEffect(() => {
    if (env.isDev) {
      // devtools(state, { name: devtoolsName, enabled: true });
    }
  }, []);

  function useSubscribe(callback: () => void) {
    useEffect(() => subscribe(state, callback), [callback]);
  }

  return {
    mutable: state,
    mut: state,
    snap: useSnapshot(state),
    useSubscribe: useSubscribe,
  };
}

/**
 * Valtio doesn't support Map() and Set() objects with the `proxy()` construct.
 */
export function useStateValtioSet<T>(val: Iterable<T> | null, opts?: { devtoolsName?: string }) {
  const [state] = useState(() => proxySet(val));

  useEffect(() => {
    if (env.isDev) {
      devtools(state, { name: opts?.devtoolsName, enabled: true });
    }
  }, []);

  function useSubscribe(callback: () => void) {
    useEffect(() => subscribe(state, callback), [callback]);
  }

  return {
    mutable: state,
    snap: useSnapshot(state),
    useSubscribe: useSubscribe,
  };
}
