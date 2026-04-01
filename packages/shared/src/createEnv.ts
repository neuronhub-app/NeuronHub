import { cleanEnv, port, str, url } from "envalid";

// @ts-ignore #bad-infer only for local IDE, VM is ok
const envRaw = typeof process === "undefined" ? import.meta.env : process.env;

export function createEnv<T extends object>(siteSchema: T) {
  const serverEnv = str({
    choices: ["development", "staging", "production"],
    default: "development",
  });
  return cleanEnv(envRaw, { NODE_ENV: serverEnv, MODE: serverEnv, ...siteSchema });
}

const envCleaned = createEnv({
  VITE_SERVER_URL: url({ default: "http://localhost:8000" }),
  VITE_CLIENT_URL: url({ default: "http://localhost:3000" }),

  VITE_SITE: str({ default: "", choices: ["", "pg"] }),

  VITE_PROJECT_NAME: str({ default: "NeuronHub" }),
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
