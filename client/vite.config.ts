import * as path from "node:path";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  root: __dirname,

  server: {
    port: 3000,
  },
  plugins: [reactRouter(), tsconfigPaths()],

  resolve: process.env.USE_SOURCE
    ? {
        alias: {
          ...getAliasReactRouterGenerated(),
          ...getAliasForProject(),
        },
      }
    : {
        alias: getAliasForProject(),
      },
});

function getAliasForProject() {
  return {
    "~/graphql": path.resolve(__dirname, "./graphql"),
    "@": path.resolve(__dirname, "./src"),
  };
}

function getAliasReactRouterGenerated() {
  return {
    "react-router": path.resolve(__dirname, "../../packages/react-router/index.ts"),
    "react-router-dom": path.resolve(__dirname, "../../packages/react-router-dom/index.tsx"),
  };
}
