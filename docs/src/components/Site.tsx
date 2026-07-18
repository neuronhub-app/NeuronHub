import { type ReactNode } from "react";

import { type SiteSlug, site } from "@/layout/siteState";

export function Site(props: { slug: SiteSlug; children: ReactNode }) {
  let slug = props.slug;
  if (slug === "nha") {
    slug = "";
  }
  return site.useCurrent() === slug ? <>{props.children}</> : null;
}
