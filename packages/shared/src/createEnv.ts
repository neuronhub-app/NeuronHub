import { cleanEnv, str } from "envalid";

// @ts-ignore #bad-infer only for local IDE, VM is ok
const envRaw = typeof process === "undefined" ? import.meta.env : process.env;

export function createEnv<T extends object>(siteSchema: T) {
  const serverEnv = str({
    choices: ["development", "staging", "production"],
    default: "development",
  });
  return cleanEnv(envRaw, { NODE_ENV: serverEnv, MODE: serverEnv, ...siteSchema });
}
