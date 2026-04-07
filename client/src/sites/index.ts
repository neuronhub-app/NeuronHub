import { env } from "@/env";
import { system as pgSystem } from "@/sites/pg/theme";
import { system } from "@/theme/theme";

export type SiteConfig = {
  theme: typeof system;
  forcedColorMode?: "light" | "dark";
  favicon: {
    svg: string;
    png96: string;
    ico: string;
    appleTouchIcon: string;
    webmanifest: string;
  };
  googleFontsHref?: string;
  meta?: {
    title: string;
    description: string;
    ogImage?: string;
  };
};

const neuronConfig: SiteConfig = {
  theme: system,
  favicon: {
    svg: "/favicon/favicon.svg",
    png96: "/favicon/favicon-96x96.png",
    ico: "/favicon/favicon.ico",
    appleTouchIcon: "/favicon/apple-touch-icon.png",
    webmanifest: "/favicon/site.webmanifest",
  },
};

const pgConfig: SiteConfig = {
  theme: pgSystem,
  forcedColorMode: "light",
  googleFontsHref:
    "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap",
  favicon: {
    svg: "/favicon/favicon.svg",
    png96: "/favicon/favicon-96x96.png",
    ico: "/favicon/favicon.ico",
    appleTouchIcon: "/favicon/apple-touch-icon.png",
    webmanifest: "/favicon/site.webmanifest",
  },
  meta: {
    title: "High-Impact Job Board | Probably Good",
    description:
      "Find a job that's good for you and good for the world. A continuously updated, curated list of high-impact job opportunities for people who want to make a difference.",
    ogImage:
      "https://cdn.prod.website-files.com/650cce2c8e093f3e9f35414f/66074f8a3e90ccf7c8c77994_Job-Board-Site-Thumbnail_1.91-1.png",
  },
};

export const siteConfig = env.VITE_SITE === "pg" ? pgConfig : neuronConfig;
