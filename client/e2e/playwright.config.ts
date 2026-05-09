import { defineConfig } from "@playwright/test";
import { authSetupStatePath } from "@/e2e/test";
import { env } from "@/env";
import { urls } from "@/urls";

const clientUrl = `http://localhost:${env.CLIENT_PORT_E2E}`;

const setupProjectName = "setup";

export default defineConfig({
  testDir: ".",
  // todo ! refac: centralize timeouts
  //
  // Default is 30s, but cold Postgres cache needs over 45s; And Algolia can take 45s by itself.
  // Then Algolia can "throttle" (?) for 10-50m and timeout at 130s.
  timeout: 80 * 1000,
  workers: 1, // default = 4
  outputDir: "test-results/",
  webServer: [
    {
      name: "Server",
      command: "mise run dev:e2e:server",
      url: `${env.VITE_SERVER_URL}/admin/login/`,
    },
    {
      name: "Server Worker",
      command: "mise run dev:e2e:server:db_worker",
    },
    {
      name: "Client",
      command: "mise run dev:e2e:client",
      url: clientUrl,
    },
  ],
  use: {
    browserName: "chromium",
    baseURL: clientUrl + (env.site.isProbablyGood ? urls.jobs.list : urls.reviews.list),
  },
  // #AI
  projects: [
    {
      name: setupProjectName,
      testMatch: "auth.setup.ts",
    },
    {
      use: { storageState: authSetupStatePath },
      dependencies: [setupProjectName],
      testDir: "./tests",
      testIgnore: env.site.isProbablyGood
        ? [
            "**/post.spec.ts",
            "**/review.spec.ts",
            "**/comment.spec.ts",
            "**/comment-hn.spec.ts",
            "**/tool.spec.ts",
            "**/vote-and-reading-list.spec.ts",
            "**/profile-list.spec.ts",
            "**/login.spec.ts",
          ]
        : [],
    },
  ],
});
