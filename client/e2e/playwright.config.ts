import { defineConfig } from "@playwright/test";
import { env } from "@/env";
import { urls } from "@/urls";

const clientUrl = `http://localhost:${env.CLIENT_PORT_E2E}`;

export default defineConfig({
  testDir: "./tests",
  timeout: 55 * 1000, // default = 30s, but cold Postgres cache often goes over 46s
  workers: 1, // default = 4
  outputDir: "test-results/",
  webServer: [
    {
      name: "Server",
      command: "mise run dev:e2e:server",
      reuseExistingServer: true,
      url: `${env.VITE_SERVER_URL}/admin/login/`,
    },
    {
      name: "Client",
      command: "mise run dev:e2e:client",
      reuseExistingServer: true,
      url: clientUrl,
    },
  ],
  use: {
    browserName: "chromium",
    baseURL: clientUrl + urls.reviews.list,
  },
});
