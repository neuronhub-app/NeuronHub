import { Box } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useLocation } from "react-router";
import { proxy } from "valtio";
import { useSnapshot } from "valtio/react";

const defaults: { title: ReactNode; description: string } = {
  title: (
    <>
      Find a job that&apos;s good,
      <br />
      for you{" "}
      <Box
        as="span"
        fontFamily="heading"
        fontStyle="italic"
        fontSize={{ base: "26px", md: "6xl" }}
        lineHeight={{ base: "32px", md: "1.2" }}
      >
        and
      </Box>{" "}
      for the world.
    </>
  ),
  description: "Curated high-impact jobs for people who want to make a difference.",
};

// `forPath` keys state to the route that wrote it — reader auto-defaults when
// pathname doesn't match, so prior-route leaks self-clear without explicit reset.
const state = proxy<{ forPath: string; title: string; description: string }>({
  forPath: "",
  title: "",
  description: "",
});

export function useHeroHeader(overrides?: { title: string; description?: string }) {
  const location = useLocation();
  const snap = useSnapshot(state);
  // Why: render-time write (not useEffect) so SSR/prerender — which doesn't
  // run effects — emits the override hero text instead of defaults.
  // The layout-level reader `<PgHeroHeader>` snapshots before this Outlet
  // child writes; `useSnapshot`'s `useSyncExternalStore` re-renders the tree
  // once the write lands, so the second pass carries the override.
  // Safe under StrictMode double-invoke: valtio skips equal-value writes;
  // `forPath` self-clears leaks on client nav.
  if (overrides) {
    state.forPath = location.pathname;
    state.title = overrides.title;
    state.description = overrides.description ?? "";
  }
  const isOverridden = snap.forPath === location.pathname && Boolean(snap.title);
  return {
    title: (isOverridden ? snap.title : defaults.title) as ReactNode,
    description: isOverridden ? snap.description : defaults.description,
    isOverridden,
  };
}
