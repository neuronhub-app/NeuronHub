import { cleanEnv, str } from "envalid";

// @ts-ignore
const envRaw = typeof process === "undefined" ? import.meta.env : process.env;

const serverEnv = str({
  choices: ["development", "staging", "production"],
  default: "development",
});

export function createEnv<T extends object>(siteSchema: T) {
  return cleanEnv(envRaw, { NODE_ENV: serverEnv, MODE: serverEnv, ...siteSchema });
}
