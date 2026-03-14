/**
 * Env single source of truth.
 */

import { port, str, url } from "envalid";
import { createEnv } from "@neuronhub/shared/createEnv";

/**
 * Envalid Options:
 * - devDefault - Avoid. Most often works badly.
 * - requiredWhen
 *
 * Types:
 * - str() - empty value is valid
 * - host() - domain or ip
 * - url() - with a protocol and hostname
 * - json() - parses with JSON.parse
 * - bool | num | email
 *
 */
const envCleaned = createEnv({
  VITE_SITE: str({ default: "", choices: ["", "pg"] }),

  VITE_PROJECT_NAME: str({ default: "NeuronHub" }),

  VITE_SENTRY_DSN_FRONTEND: str({ default: "" }),

  VITE_SERVER_URL: url({ default: "http://localhost:8000" }),

  VITE_RELEASE_NAME: str(), // for Sentry Source Maps, defined in [[mise.toml]]

  CLIENT_PORT_E2E: port({ default: 3001 }),
});

export const env = {
  ...envCleaned,
  get VITE_SERVER_URL_API(): string {
    return `${this.VITE_SERVER_URL}/api/graphql`;
  },
  get isProd(): boolean {
    return this.MODE === "production" || this.NODE_ENV === "production";
  },
};
