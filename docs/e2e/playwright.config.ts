import { defineConfig } from "@playwright/test";
import { env } from "../src/env";

const baseURL = `http://localhost:${env.DOCS_PORT_E2E}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 16,
  outputDir: "./test-results/",
  webServer: {
    command: "bun run dev",
    url: baseURL,
    reuseExistingServer: true,
  },
  use: {
    baseURL,
  },
});
