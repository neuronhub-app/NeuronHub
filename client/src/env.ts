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
const envCleaned = cleanEnv(envRaw, {
  NODE_ENV: str({
    choices: ["development", "staging", "production"],
    default: "development",
  }),

  VITE_SERVER_URL: url({ default: "http://localhost:8000" }),

  CLIENT_PORT_E2E: port({ default: 3001 }),
});

export const env = {
  ...envCleaned,
  get VITE_SERVER_URL_API(): string {
    return `${this.VITE_SERVER_URL}/api/graphql`;
  },
};
