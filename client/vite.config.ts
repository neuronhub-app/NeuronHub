import { reactRouter } from "@react-router/dev/vite";
import { sentryReactRouter } from "@sentry/react-router";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(config => ({
  root: __dirname,
  server: {
    port: 3000,
    allowedHosts: ["localhost", "client"],
  },
  build: { sourcemap: true },
  dev: { sourcemap: true },
  plugins: [
    reactRouter(),
    tsconfigPaths(),
    devtoolsJson(),
    sentryReactRouter(
      {
        authToken: process.env.SENTRY_AUTH_TOKEN,
        release: { name: process.env.VITE_RELEASE_NAME },
        telemetry: false,
      },
      config,
    ),
  ],
}));
