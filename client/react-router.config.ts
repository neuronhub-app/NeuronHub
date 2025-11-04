import type { Config } from "@react-router/dev/config";
import { sentryOnBuildEnd } from "@sentry/react-router";

export default {
  ssr: false,
  appDirectory: "src",
    buildEnd: async ({ viteConfig, reactRouterConfig, buildManifest }) => {
    // place last
    +(await sentryOnBuildEnd({ viteConfig, reactRouterConfig, buildManifest }));
  },
} satisfies Config;
