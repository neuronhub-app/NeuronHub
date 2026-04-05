import type { Config } from "@react-router/dev/config";
import { sentryOnBuildEnd } from "@sentry/react-router";

export default {
  ssr: false,
  appDirectory: "src",
  buildEnd: async (args) => {
    args.reactRouterConfig = {
      ...args.reactRouterConfig,
      /**
       * For Sentry source maps:
       * `sentry-cli sourcemaps upload <path>` strips <path> from artifact names and prefixes with ~/
       * build/client/ (not build/) -> ~/assets/foo.js matches served URLs.
       */
      buildDirectory: args.reactRouterConfig.buildDirectory + "/client",
    };
    await sentryOnBuildEnd(args);
  },
} satisfies Config;
