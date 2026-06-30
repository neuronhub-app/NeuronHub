/**
 * #AI-slop #quality-10%, e2e tested. Code & comments are trash.
 */
import { useLocation } from "react-router";
import { proxy } from "valtio";
import { useSnapshot } from "valtio/react";

import { type SeoMeta, seoMetaByPath } from "@/components/seoMetaByPath";
import { env } from "@/env";
import { siteConfig } from "@/sites";
import { urls } from "@/urls";

function defaults(seoMeta?: SeoMeta) {
  return {
    title: seoMeta?.meta_title || siteConfig.meta?.title,
    description: seoMeta?.meta_description || siteConfig.meta?.description || "",
    ogImage: seoMeta?.meta_image_url || siteConfig.meta?.ogImage || "",
  };
}

// `pathname` keys state to the route that wrote it — reader returns defaults
// when pathname doesn't match, so prior-route leaks (SSR module cache + client
// nav to a non-overriding route) self-clear without an explicit reset.
const state = proxy({ ...defaults(), pathname: "" });

// Module-scope reference: defining inline in `useHeadMeta()` would let React
// see a new component type each call → unmount/remount.
function HeadMetaHoisted() {
  const location = useLocation();
  const snap = useSnapshot(state);
  const seoMetas = useSnapshot(seoMetaByPath);

  const isJobsAlias = env.VITE_SITE === "pg" && location.pathname === "/jobs";
  const isJobDetail = env.VITE_SITE === "pg" && location.pathname.startsWith("/jobs/");

  const pathCanonical = isJobsAlias ? urls.jobs.list : location.pathname;
  // Job pages borrow `/` meta (interim) yet stay self-canonical above. TODO: per-job meta.
  const pathForMeta = isJobsAlias || isJobDetail ? urls.jobs.list : location.pathname;

  const dflt = defaults(seoMetas[pathForMeta]);
  const isCurrentPage = snap.pathname === location.pathname;
  const title = `${(isCurrentPage && snap.title) || dflt.title || "Loading..."} | ${env.VITE_PROJECT_NAME}`;
  const description = isCurrentPage ? snap.description || dflt.description : dflt.description;
  const ogImage = isCurrentPage ? snap.ogImage || dflt.ogImage : dflt.ogImage;

  return (
    <>
      <title>{title}</title>
      <link rel="canonical" href={pathCanonical} />
      {description && <meta name="description" content={description} />}
      <meta property="og:title" content={title} />
      <meta property="og:site_name" content={env.VITE_PROJECT_NAME} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:type" content="website" />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </>
  );
}

export function useHeadMeta(overrides?: {
  title?: string;
  description?: string;
  ogImage?: string;
}) {
  const location = useLocation();
  // Why: render-time write (not useEffect) so SSR/prerender — which doesn't
  // run effects — emits the override `<title>` instead of defaults.
  // The root-level reader `<headMeta.Hoisted />` snapshots before this Outlet
  // child writes; `useSnapshot`'s `useSyncExternalStore` re-renders the tree
  // once the write lands, so the second pass carries the override.
  // Safe under StrictMode double-invoke: valtio skips equal-value writes;
  // `pathname` self-clears leaks on client nav.
  if (overrides) {
    // Always overwrite all fields — partial writes leak prior-route values
    // (`pathname` is set to the current route → reader treats stale fields as fresh).
    state.pathname = location.pathname;
    state.title = overrides.title;
    state.description = overrides.description ?? "";
    state.ogImage = overrides.ogImage ?? "";
  }
  return { Hoisted: HeadMetaHoisted };
}
