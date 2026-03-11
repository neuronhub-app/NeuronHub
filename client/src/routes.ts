import type { RouteConfig } from "@react-router/dev/routes";

// Vite fails to import `@/` in routes.ts
import { env } from "./env";
import { routes } from "./sites/neuronhub/routes";
import { routes as pgRoutes } from "./sites/pg/routes";

export default (env.VITE_SITE === "pg" ? pgRoutes : routes) satisfies RouteConfig;
