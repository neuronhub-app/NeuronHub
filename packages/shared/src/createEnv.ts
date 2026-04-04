import { cleanEnv, port, str, url } from "envalid";

// @ts-ignore #bad-infer only for local IDE, VM is ok
const envRaw = typeof process === "undefined" ? import.meta.env : process.env;

/**
 * Both NODE and NODE_ENV are used. Sometimes. I don't want to know.
 */
export function createEnv<T extends object>(siteSchema: T) {
  const serverEnv = str({
    choices: [
      // NODE values, just in case
      "development",
      "staging",
      "production",
      // DJANGO_ENV values
      "prod",
      "stage",
      "dev",
      "dev_test_e2e",
    ],
    default: "dev",
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
    return (
      this.MODE === "production" ||
      this.MODE === "prod" ||
      this.NODE_ENV === "production" ||
      this.NODE_ENV === "prod"
    );
  },
  get isDev(): boolean {
    return (
      this.MODE === "development" ||
      this.MODE === "dev" ||
      this.NODE_ENV === "development" ||
      this.NODE_ENV === "dev"
    );
  },
};
