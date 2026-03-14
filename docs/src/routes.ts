/**
 * #AI
 */
import { globSync } from "node:fs";
import { type RouteConfig, layout, route } from "@react-router/dev/routes";

export default [
  layout("components/DocsLayout.tsx", [
    route("/", "pages/index.tsx"),
    ...globSync("pages/**/*.mdx", { cwd: import.meta.dirname }).map(file => {
      const slug = file.replace("pages/", "").replace(".mdx", "").toLowerCase();
      return route(`/${slug}`, file);
    }),
  ]),
] satisfies RouteConfig;
