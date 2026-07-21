import { type ReactNode } from "react";

import { type SiteSlug, site, siteSlug } from "@/layout/siteState";

export function Site(props: { slug: SiteSlug; children: ReactNode }) {
  let slug = props.slug;
  if (slug === siteSlug.nhaAlias) {
    slug = siteSlug.nha;
  }
  return site.useCurrent() === slug ? <>{props.children}</> : null;
}
