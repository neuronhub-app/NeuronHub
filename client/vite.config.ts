import { reactRouter } from "@react-router/dev/vite";
import { sentryReactRouter } from "@sentry/react-router";
import { defineConfig } from "vite";
import babel from "vite-plugin-babel";
import devtoolsJson from "vite-plugin-devtools-json";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(config => ({
  root: __dirname,
  server: {
    port: 3000,
    allowedHosts: [process.env.CLIENT_DOMAIN ?? "localhost"],
  },
  build: { sourcemap: true },
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
        telemetry: false,
      },
      config,
    ),
  ],
}));
