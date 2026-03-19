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
  googleFontsHref?: string;
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
  googleFontsHref:
    "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=IBM+Plex+Serif:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap",
  favicon: {
    svg: "/favicon/favicon.svg",
    png96: "/favicon/favicon-96x96.png",
    ico: "/favicon/favicon.ico",
    appleTouchIcon: "/favicon/apple-touch-icon.png",
    webmanifest: "/favicon/site.webmanifest",
  },
};

export const siteConfig = env.VITE_SITE === "pg" ? pgConfig : neuronConfig;
