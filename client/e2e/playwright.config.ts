import { defineConfig } from "@playwright/test";
import { config } from "@/e2e/config";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  workers: 1, // default = 4
  expect: {
    timeout: 2000, // default = 5s
  },
  webServer: [
    {
      // --quiet keeps stderr wo/ stdout
      command: `mise run --quiet dev:server ${config.server.port} --nothreading`,
      name: "Server",
      url: `${config.server.url}/admin/login/`,
      env: {
        SERVER_URL: config.server.url,
        CLIENT_URL: config.client.url,
        DATABASE_NAME: config.server.databaseName,
        IS_DJANGO_RUNSERVER_STDERR_ONLY: "true",
        E2E_TEST: "true",
      },
    },
    {
      command: `mise run dev:client --port ${config.client.port}`,
      name: "Client",
      url: config.client.url,
      env: {
        VITE_SERVER_URL: config.server.url,
      },
    },
  ],
  reporter: [["list", { printSteps: true }]],
  use: {
    trace: "off",
    browserName: "chromium",
    baseURL: config.client.url,
  },
});
