/**
 * Env single source of truth.
 */
import { bool, cleanEnv, port, str } from "envalid";

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
const envSource = typeof process !== "undefined" ? process.env : import.meta.env;
const envCleaned = cleanEnv(envSource, {
  NODE_ENV: str({
    choices: ["development", "staging", "production"],
    default: "development",
  }),

  VITE_E2E_TEST: bool({ default: false }),
  VITE_E2E_CLIENT_PORT: port({ default: 3001, choices: [3001, 3002] }),
  VITE_E2E_SERVER_PORT: port({ default: 8001, choices: [8001, 8002] }),
  VITE_E2E_DB_NAME: str({ default: "test_neuronhub_1" }),

  VITE_CLIENT_PORT: port({ default: 2999, choices: [3000, 2999, 2998] }),

  VITE_SERVER_SCHEMA: str({ default: "http" }),
  VITE_SERVER_DOMAIN: str({ default: "localhost" }),
  VITE_SERVER_PORT: port({ choices: [7998, 7999, 8000], default: 8000 }),
});

export const env = {
  ...envCleaned,
  get VITE_SERVER_URL(): string {
    const urlBase = `${envCleaned.VITE_SERVER_SCHEMA}://${envCleaned.VITE_SERVER_DOMAIN}`;
    if (this.VITE_E2E_TEST) {
      return `${urlBase}:${this.VITE_E2E_SERVER_PORT}`;
    }
    return `${urlBase}:${this.VITE_SERVER_PORT}`;
  },
  get VITE_SERVER_URL_API(): string {
    return `${this.VITE_SERVER_URL}/api/graphql`;
  },
};
