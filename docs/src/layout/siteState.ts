/**
 * #AI
 */
import { proxy, useSnapshot } from "valtio";

export type SiteSlug = "" | "pg" | "nha";

const state = proxy<{ current: SiteSlug }>({ current: "" });
const storageKey = "nha-docs-site";
const urlParam = "site";

export const site = {
  useCurrent(): SiteSlug {
    return useSnapshot(state).current;
  },

  set(value: SiteSlug) {
    state.current = value;
    localStorage.setItem(storageKey, value);
    reflectInUrl(value);
  },

  reflectInUrl,

  // Client-only; call once on mount. Server never runs it → SSR stays "" (no hydration mismatch).
  // A shared `?site=pg` link wins over localStorage, so fresh visitors see the pg view.
  hydrate() {
    const fromUrl = new URLSearchParams(window.location.search).get(urlParam);
    const isPg = fromUrl === "pg" || localStorage.getItem(storageKey) === "pg";
    state.current = isPg ? "pg" : "";
    localStorage.setItem(storageKey, state.current);
    reflectInUrl(state.current);
  },
};

// URL is a derived reflection of state: replaceState bypasses react-router.
function reflectInUrl(value: SiteSlug) {
  const url = new URL(window.location.href);
  if (value === "pg") {
    url.searchParams.set(urlParam, value);
  } else {
    url.searchParams.delete(urlParam);
  }
  history.replaceState(history.state, "", url);
}
