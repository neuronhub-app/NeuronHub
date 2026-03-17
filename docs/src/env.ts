import { url, port } from "envalid";
import { createEnv } from "@neuronhub/shared/createEnv";

export const env = createEnv({
  VITE_CLIENT_URL: url({ default: "http://localhost:3000" }),
  DOCS_PORT_E2E: port({ default: 4001 }),
});
