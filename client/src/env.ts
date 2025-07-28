import { cleanEnv, str, url } from "envalid";

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
export const env = cleanEnv(import.meta.env ?? {}, {
  NODE_ENV: str({
    choices: ["development", "staging", "production"],
    default: "development",
  }),
  VITE_SERVER_URL: url({
    default: "http://localhost:8000",
  }),
});
