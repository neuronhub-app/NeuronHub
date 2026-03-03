import type { RouteConfig } from "@react-router/dev/routes";
import { env } from "./env";
import neuronRoutes from "./sites/neuronhub/routes";
import pgRoutes from "./sites/pg/routes";

export default (env.VITE_SITE === "pg" ? pgRoutes : neuronRoutes) satisfies RouteConfig;
