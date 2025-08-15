import { defineConfig } from "@playwright/test";
import { env } from "@/env";

const clientUrl = `http://${env.VITE_SERVER_DOMAIN}:${env.VITE_E2E_CLIENT_PORT}`;

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
      command: `mise run --quiet dev:server ${env.VITE_E2E_SERVER_PORT} --nothreading`,
      name: "Server",
      url: `${env.VITE_SERVER_URL}/admin/login/`,
      env: {
        VITE_E2E_TEST: "true",
        IS_DJANGO_RUNSERVER_STDERR_ONLY: "true",
        SERVER_URL: env.VITE_SERVER_URL,
        CLIENT_URL: clientUrl,
        DATABASE_NAME: env.VITE_E2E_DB_NAME,
      },
    },
    {
      command: `mise run dev:client --port ${env.VITE_E2E_CLIENT_PORT}`,
      name: "Client",
      url: clientUrl,
      env: {
        VITE_E2E_TEST: "true",
        VITE_E2E_CLIENT_PORT: env.VITE_E2E_CLIENT_PORT.toString(),
        VITE_E2E_SERVER_PORT: env.VITE_E2E_SERVER_PORT.toString(),
        VITE_E2E_DB_NAME: env.VITE_E2E_DB_NAME,
        VITE_SERVER_DOMAIN: env.VITE_SERVER_DOMAIN,
        VITE_SERVER_SCHEMA: env.VITE_SERVER_SCHEMA,
      },
    },
  ],
  reporter: [["list", { printSteps: true }]],
  use: {
    trace: "off",
    browserName: "chromium",
    baseURL: clientUrl,
  },
});
