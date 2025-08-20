import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import devtoolsJson from "vite-plugin-devtools-json";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  root: __dirname,
  server: {
    port: 3000,
    allowedHosts: ["localhost", "client"],
  },
  plugins: [reactRouter(), tsconfigPaths(), devtoolsJson()],
  build: { sourcemap: true },
  dev: { sourcemap: true },
});
