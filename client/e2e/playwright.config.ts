import { defineConfig } from "@playwright/test";
import { env } from "@/env";
import { urls } from "@/urls";

const clientUrl = `http://localhost:${env.CLIENT_PORT_E2E}`;

export default defineConfig({
  testDir: "./tests",
  timeout: 55 * 1000, // default = 30s, but cold Postgres cache often goes over 46s
  workers: 1, // default = 4
  outputDir: "test-results/",
  testIgnore:
    env.VITE_SITE === "pg"
      ? [
          "**/post.spec.ts",
          "**/review.spec.ts",
          "**/comment.spec.ts",
          "**/comment-hn.spec.ts",
          "**/tool.spec.ts",
          "**/library.spec.ts",
          "**/vote-and-reading-list.spec.ts",
          "**/profile-list.spec.ts",
          "**/login.spec.ts",
        ]
      : [],
  webServer: [
    {
      name: "Server",
      command: "mise run dev:e2e:server",
      reuseExistingServer: true,
      url: `${env.VITE_SERVER_URL}/admin/login/`,
    },
    {
      name: "Server Worker",
      command: "mise run dev:e2e:server:db_worker",
      reuseExistingServer: true,
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
    baseURL: clientUrl + (env.VITE_SITE === "pg" ? urls.jobs.list : urls.reviews.list),
  },
});
