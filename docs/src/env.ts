import { cleanEnv, str, url } from "envalid";

const serverEnv = str({
  choices: ["development", "staging", "production"],
  default: "development",
});

const envRaw = typeof process === "undefined" ? import.meta.env : process.env;

const envCleaned = cleanEnv(envRaw, {
  NODE_ENV: serverEnv,
  MODE: serverEnv,

  VITE_CLIENT_URL: url({ default: "http://localhost:3000" }),
});

export const env = {
  ...envCleaned,
  get isProd(): boolean {
    return this.MODE === "production" || this.NODE_ENV === "production";
  },
};
