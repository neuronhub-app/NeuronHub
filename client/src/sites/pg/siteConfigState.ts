import { captureException } from "@sentry/react";
import { proxy, useSnapshot } from "valtio";

import { seoMetaByPath } from "@/components/seoMetaByPath";
import { env } from "@/env";
import { graphql, type ResultOf } from "@/gql-tada";
import { client } from "@/graphql/client";

const SiteConfigQuery = graphql.persisted(
  "SiteConfigQuery",
  graphql(`
    query SiteConfigQuery {
      seo_metas {
        path
        meta_title
        meta_description
        meta_image_url
      }
      site {
        contact_email
        jobs_url_utm_source
        nav_links {
          id
          label
          href
          links {
            id
            label
            href
          }
        }
        footer_sections {
          id
          kind
          title
          links {
            id
            label
            href
            icon
          }
        }
      }
    }
  `),
);

export type SiteConfigData = NonNullable<ResultOf<typeof SiteConfigQuery>["site"]>;
export type FooterSection = SiteConfigData["footer_sections"][number];

export const siteConfigState = proxy<{
  data: SiteConfigData | null;
  isLoading: boolean;
}>({
  data: null,
  isLoading: true,
});

if (env.mode.isClient) {
  client.query({ query: SiteConfigQuery }).then(result => {
    siteConfigState.data = result.data?.site ?? null;
    siteConfigState.isLoading = false;
    for (const seoMeta of result.data?.seo_metas ?? []) {
      seoMetaByPath[seoMeta.path] = {
        meta_title: seoMeta.meta_title,
        meta_description: seoMeta.meta_description,
        meta_image_url: seoMeta.meta_image_url,
      };
    }
  });
}

export function useSiteConfig() {
  return useSnapshot(siteConfigState).data;
}

export function appendUtmSource(url: string): string {
  const utmSource = siteConfigState.data?.jobs_url_utm_source;
  if (!url || !utmSource) {
    return url;
  }
  try {
    if (!url.includes("http")) {
      // oxlint-disable-next-line no-param-reassign
      url = `https://${url}`;
    }
    const urlParsed = new URL(url);
    urlParsed.searchParams.set("utm_source", utmSource);
    return urlParsed.toString();
  } catch (error) {
    captureException("JobCard: not added UTM to a URL", { extra: { url } });
    return url;
  }
}
