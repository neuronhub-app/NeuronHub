import { url } from "envalid";
import { createEnv } from "@neuronhub/shared/createEnv";

export const env = createEnv({
  VITE_CLIENT_URL: url({ default: "http://localhost:3000" }),
});
