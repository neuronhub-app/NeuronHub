/**
 * Env's single source of truth.
 */

import { port, str, bool, url } from "envalid";
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

  VITE_IS_TIRED_OWL_DEV: bool({ default: false }),

  VITE_ADMIN_EMAIL: str({ default: "" }),

  VITE_SENTRY_DSN_FRONTEND: str({ default: "" }),

  VITE_SERVER_URL: url({ default: "http://localhost:8000" }),

  VITE_RELEASE_NAME: str(), // for Sentry Source Maps, defined in [[mise.toml]]

  VITE_GTM_ID: str({ default: "" }),

  VITE_POSTHOG_TOKEN: str({ default: "" }),
  VITE_POSTHOG_HOST: url({ default: "" }),

  CLIENT_PORT: port({ default: 3000 }),
  CLIENT_PORT_E2E: port({ default: 3001 }),
});

export const env = {
  ...envCleaned,

  get VITE_SERVER_URL_API(): string {
    return `${this.VITE_SERVER_URL}/api/graphql`;
  },
  get isProd(): boolean {
    return this.VITE_ENV === "prod";
  },
  get isDev(): boolean {
    return this.VITE_ENV.startsWith("dev");
  },
  // stage & prod: eg for robots noindex & Sentry
  get isPublicDeployed(): boolean {
    return !this.isDev;
  },
  get site() {
    const site = this.VITE_SITE;
    return {
      get isProbablyGood() {
        return site === "pg";
      },
      get isNeuronHub() {
        return site === "";
      },
    };
  },
  get isTiredOwlDev(): boolean {
    return this.VITE_IS_TIRED_OWL_DEV;
  },
};
