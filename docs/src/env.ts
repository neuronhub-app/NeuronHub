import { url, port, str } from "envalid";
import { createEnv } from "@neuronhub/shared/createEnv";

export const env = createEnv({
  VITE_CLIENT_URL: url({ default: "" }),
  VITE_SERVER_URL: url({ default: "" }),
  DOCS_PORT_E2E: port({ default: 4010 }),
  DOCS_PORT: port({ default: 4000 }),
  VITE_ALGOLIA_APPLICATION_ID: str({ default: "" }),
  VITE_ALGOLIA_SEARCH_API_KEY: str({ default: "" }),
  VITE_ALGOLIA_INDEX_DOCS: str({ default: "" }),
});
