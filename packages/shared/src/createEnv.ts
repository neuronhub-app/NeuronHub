import { cleanEnv, str, url } from "envalid";

// @ts-ignore #bad-infer only for local IDE, VM is ok
const envRaw = typeof process === "undefined" ? import.meta.env : process.env;

export function createEnv<T extends object>(siteSchema: T) {
  return cleanEnv(envRaw, {
    VITE_ENV: str({
      choices: ["prod", "stage", "dev", "dev_test_e2e"],
      default: "dev",
    }),
    ...siteSchema,
  });
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
    return this.VITE_ENV === "prod";
  },
  get isDev(): boolean {
    return this.VITE_ENV.startsWith("dev");
  },
  // stage & prod: eg for robots noindex & Sentry
  get isPublicDeployed(): boolean {
    return !this.isDev;
  },
};
