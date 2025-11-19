/**
 * Env single source of truth.
 */

import { cleanEnv, port, str, url } from "envalid";

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
const envRaw = typeof process === "undefined" ? import.meta.env : process.env;

const serverEnv = str({
  choices: ["development", "staging", "production"],
  default: "development",
});

const envCleaned = cleanEnv(envRaw, {
  VITE_PROJECT_NAME: str({ default: "NeuronHub" }),

  NODE_ENV: serverEnv,
  MODE: serverEnv, // used by the Vite instead of NODE_ENV as a hack. We don't care re historical difference - hence the merge.

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
