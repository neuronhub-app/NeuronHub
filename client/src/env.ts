import { bool, cleanEnv, port, str, url } from "envalid";

let envCurrent: object = import.meta.env;
if (typeof process !== "undefined") {
  envCurrent = process.env;
}

/**
 * a summary of README.md github.com/af/envalid
 *
 * - str() - empty value is valid
 * - bool()
 * - num()
 * - email()
 * - host() - domain or ip
 * - url() - with a protocol and hostname
 * - json() - parses with JSON.parse
 *
 * options:
 * - choices
 * - default
 * - devDefault - if NODE_ENV !== "production", eg if required only in prod.
 * - desc
 * - example - example value
 * - docs - A URL to docs
 * - requiredWhen
 */
const envCleaned = cleanEnv(envCurrent ?? {}, {
  NODE_ENV: str({
    choices: ["development", "staging", "production"],
    default: "development",
  }),

  E2E_TEST: bool({ default: false }),
  E2E_CLIENT_PORT: port({ default: 3001, choices: [3001, 3002] }),
  E2E_SERVER_PORT: port({ default: 8001, choices: [8001, 8002] }),
  E2E_DB_NAME: str({ default: "test_neuronhub_1" }),

  SERVER_PORT: port({ choices: [7999, 8000], default: undefined }),

  VITE_SERVER_URL: url({ default: `http://localhost:7999` }),
});

export const env = {
  ...envCleaned,
  get VITE_SERVER_URL(): string {
    if (this.E2E_TEST) {
      return `http://localhost:${this.E2E_SERVER_PORT}`;
    } else if (this.SERVER_PORT) {
      return `http://localhost:${this.SERVER_PORT}`;
    }
    return envCleaned.VITE_SERVER_URL;
  },
  get VITE_SERVER_URL_API(): string {
    return `${this.VITE_SERVER_URL}/api/graphql`;
  },
};
