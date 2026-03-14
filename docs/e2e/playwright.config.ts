import { defineConfig } from "@playwright/test";

const baseURL = "http://localhost:2500";

export default defineConfig({
  testDir: "./tests",
  outputDir: "test-results/",
  webServer: {
    command: "bun run dev",
    url: baseURL,
    reuseExistingServer: true,
  },
  use: {
    baseURL,
  },
});
