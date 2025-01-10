import { cleanEnv, str } from "envalid";

/**
 * oddly doesn't load vite envs, eg NODE_ENV
 *
 * *a shortened copy from README.md from v8 https://github.com/af/envalid*
 *
 * - str() - empty value is valid
 * - bool()
 * - num()
 * - email()
 * - host() - domain or ip
 * - port() - TCP port (1-65535)
 * - url() - a URL with a protocol and hostname
 * - json() - parses with JSON.parse
 *
 * options:
 * - choices
 * - default - serialized default
 * - devDefault - if NODE_ENV !== "production". Good when required in prod, but optional in dev.
 * - desc
 * - example - example value
 * - docs - A URL to docs
 * - requiredWhen
 */
export const env = cleanEnv(import.meta.env, {
  NODE_ENV: str({
    choices: ["development", "test", "production", "staging"],
    devDefault: "development",
    default: undefined,
  }),
});
