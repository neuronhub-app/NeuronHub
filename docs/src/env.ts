import { url } from "envalid";
import { createEnv } from "@neuronhub/shared/createEnv";

const envCleaned = createEnv({
  VITE_CLIENT_URL: url({ default: "http://localhost:3000" }),
});

export const env = {
  ...envCleaned,
  get isProd(): boolean {
    return this.MODE === "production" || this.NODE_ENV === "production";
  },
};
