import { proxy } from "valtio";
import { graphql, type ResultOf } from "@/gql-tada";
import { client } from "@/graphql/client";

const SiteConfigQuery = graphql.persisted(
  "SiteConfigQuery",
  graphql(`
    query SiteConfigQuery {
      site {
        jobs_url_utm_source
        nav_links {
          id
          label
          href
          children {
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

client.query({ query: SiteConfigQuery }).then(result => {
  siteConfigState.data = result.data?.site ?? null;
  siteConfigState.isLoading = false;
});

export function appendUtmSource(url: string): string {
  const utmSource = siteConfigState.data?.jobs_url_utm_source;
  if (!url || !utmSource) {
    return url;
  }
  const urlParsed = new URL(url);
  urlParsed.searchParams.set("utm_source", utmSource);
  return urlParsed.toString();
}
