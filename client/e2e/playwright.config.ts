import { defineConfig } from "@playwright/test";
import { env } from "@/env";
import { urls } from "@/routes";

const clientUrl = `http://localhost:${env.CLIENT_PORT_E2E}`;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1, // default = 4
  webServer: [
    {
      name: "Server",
      command: "mise run dev:server:e2e",
      reuseExistingServer: true,
      url: `${env.VITE_SERVER_URL}/admin/login/`,
    },
    {
      name: "Client",
      command: "mise run dev:client:e2e",
      reuseExistingServer: true,
      url: clientUrl,
    },
  ],
  use: {
    browserName: "chromium",
    baseURL: clientUrl + urls.reviews.list,
  },
});
