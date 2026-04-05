import { reactRouter } from "@react-router/dev/vite";
import { sentryReactRouter } from "@sentry/react-router";
import { defineConfig } from "vite";
import babel from "vite-plugin-babel";
import devtoolsJson from "vite-plugin-devtools-json";
import tsconfigPaths from "vite-tsconfig-paths";
// noinspection ES6PreferShortImport: Vite loads before tsconfig.json
import { env } from "./src/env";

export default defineConfig(config => ({
  root: __dirname,
  server: {
    port: env.CLIENT_PORT,
    allowedHosts: [process.env.CLIENT_DOMAIN ?? "localhost"],
    hmr: env.isDev && env.VITE_ENV !== "dev_test_e2e",
  },
  build: { sourcemap: "hidden" },
  dev: { sourcemap: true },
  plugins: [
    reactRouter(),
    // from react.dev docs
    babel({
      filter: /\.[jt]sx?$/,
      babelConfig: {
        presets: ["@babel/preset-typescript"],
        plugins: [["babel-plugin-react-compiler"]],
        compact: false, // removes whitespaces, ie redundant and pollutes E2E logs
      },
    }),
    tsconfigPaths(),
    devtoolsJson(),
    sentryReactRouter(
      {
        authToken: process.env.SENTRY_AUTH_TOKEN,
        release: { name: process.env.VITE_RELEASE_NAME },
        debug: true,
        telemetry: false,

        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
      },
      config,
    ),
  ],
}));
