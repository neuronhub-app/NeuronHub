import { env } from "@/env";
import { system as pgSystem } from "@/sites/pg/theme";
import { system } from "@/theme/theme";

export type SiteConfig = {
  theme: typeof system;
  favicon: {
    svg: string;
    png96: string;
    ico: string;
    appleTouchIcon: string;
    webmanifest: string;
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
  favicon: {
    svg: "/favicon-pg/favicon.svg",
    png96: "/favicon-pg/favicon-96x96.png",
    ico: "/favicon-pg/favicon.ico",
    appleTouchIcon: "/favicon-pg/apple-touch-icon.png",
    webmanifest: "/favicon-pg/site.webmanifest",
  },
};

export const siteConfig = env.VITE_SITE === "pg" ? pgConfig : neuronConfig;
